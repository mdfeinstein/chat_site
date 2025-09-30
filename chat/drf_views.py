from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status
from .models import ChatUser, Message, Chat
from django.db import transaction
from .serializers import (
    AuthTokenRequestSerializer,
    AuthTokenResponseSerializer,
    AuthErrorResponseSerializer,
    MessageByChatSerializer,
    SuccessResponseSerializer,
    ErrorResponseSerializer,
    ChatUserSerializer,
    ChatUserMinimalSerializer,
    ChatUsersMinimalSerializer,
    FriendsListSerializer,
    MessageSerializer,
    NewMessageSerializer,
    MessagesSerializer,
    MessageRequestSerializer,
    ChatSerializer,
    ChatDataSerializer,
    ChatWithHistorySerializer,
    ChatsWithHistorySerializer,
    FriendDataSerializer,
)
from .ws_notifications import (
    notify_friends_list_change,
    notify_chat_list_change,
)
from django.contrib.auth.models import User
from django.db.models import Q, Max
from drf_spectacular.utils import extend_schema, OpenApiParameter
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@extend_schema(
    description="Logout with token",
    request=None,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_auth(request):
    request.user.auth_token.delete()
    return Response({"success": True, "message": "Token revoked"})


@extend_schema(
    description="Get chat data for a specific chat",
    responses={200: ChatDataSerializer, 404: ErrorResponseSerializer},
    #  parameters=[OpenApiParameter(name="chat_id", type=int, location=OpenApiParameter.QUERY)]
)
@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_chat_data(request, chat_id=None):
    print(chat_id)
    if chat_id is None:
        chat_id = request.GET.get("chat_id")
    chat_user = ChatUser.objects.get(user=request.user)
    chat = Chat.objects.filter(users=chat_user).get(pk=chat_id)
    if chat is None:
        return Response(
            {
                "success": False,
                "message": "Chat with this ID either does not exist or you are not a member",
            },
            status=status.HTTP_404_NOT_FOUND,
        )
    serializer = ChatDataSerializer.from_chat(chat)
    return Response(serializer.data)


@extend_schema(
    description="Get users chats with recent messages",
    responses={200: ChatsWithHistorySerializer},
    #  parameters=[OpenApiParameter(name="chat_id", type=int, location=OpenApiParameter.QUERY)]
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chats_with_history(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = (
        Chat.objects.filter(users=chat_user)
        .exclude(usersExited=chat_user)
        .annotate(last_message_time=Max("messages__createdAt"))
        .order_by("-last_message_time")
    )
    chats_data = []
    for chat in chats:
        last_messages = chat.messages.order_by("-message_number")[:10]
        chat_serializer = (
            ChatWithHistorySerializer.from_chat_and_last_messages(
                chat, last_messages
            )
        )
        chats_data.append(chat_serializer.data)

    return Response(
        ChatsWithHistorySerializer({"chats": chats_data}).data
    )


@extend_schema(
    description="Get friends and invites/requests sorted by category",
    responses={200: FriendDataSerializer},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friends_list(request):
    chat_user = ChatUser.objects.get(user=request.user)
    friends_list = chat_user.friends_list
    online_friends = friends_list.friends.filter(loggedIn=True)
    offline_friends = friends_list.friends.filter(loggedIn=False)
    requested_users = friends_list.requested_users.all()
    invited_by = ChatUser.objects.filter(
        friends_list__requested_users=chat_user
    )
    serializer = FriendDataSerializer(
        {
            "online_friends": online_friends,
            "offline_friends": offline_friends,
            "requested_users": requested_users,
            "invited_by": invited_by,
        }
    )
    return Response(serializer.data)


@extend_schema(
    description="Send a friend request",
    request=ChatUserMinimalSerializer,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_request(request):
    chat_user = ChatUser.objects.get(user=request.user)
    serializer = ChatUserMinimalSerializer(data=request.data)
    if serializer.is_valid():
        requested_user = ChatUser.objects.get(
            user__username=serializer.data.get("username")
        )
        if requested_user is None:
            return Response(
                {"success": False, "message": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        # check if requested_user requested chat_user and make both friends if so
        if requested_user.friends_list.requested_users.filter(
            pk=chat_user.pk
        ).exists():
            requested_user.friends_list.requested_users.remove(
                chat_user
            )
            requested_user.friends_list.friends.add(chat_user)
            chat_user.friends_list.friends.add(requested_user)
            with transaction.atomic():
                chat_user.friends_list.save()
                requested_user.friends_list.save()

            # notify both parties of friends list change
            notify_friends_list_change(chat_user.pk)
            notify_friends_list_change(requested_user.pk)
            return Response(
                {
                    "success": True,
                    "message": "Request sent, reciprocal, friend added",
                },
                status=status.HTTP_200_OK,
            )
        else:
            chat_user.friends_list.requested_users.add(requested_user)
            chat_user.friends_list.save()
            # notify both parties of friends list change
            notify_friends_list_change(chat_user.pk)
            notify_friends_list_change(requested_user.pk)
            return Response(
                {"success": True, "message": "Request sent"},
                status=status.HTTP_200_OK,
            )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    description="Cancel a friend request",
    request=ChatUserMinimalSerializer,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_request(request):
    chat_user = ChatUser.objects.get(user=request.user)
    # get the requesting user by deserializing the data
    serializer = ChatUserMinimalSerializer(data=request.data)
    if serializer.is_valid():
        requested_user = ChatUser.objects.get(
            user__username=serializer.data.get("username")
        )
        if requested_user is None:
            return Response(
                {"success": False, "message": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        chat_user.friends_list.requested_users.remove(requested_user)
        chat_user.friends_list.save()

        # notify both parties of friends list change
        notify_friends_list_change(chat_user.pk)
        notify_friends_list_change(requested_user.pk)

        return Response(
            {"success": True, "message": "Request cancelled"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    description="Accept a friend request",
    request=ChatUserMinimalSerializer,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_friend_request(request):
    chat_user = ChatUser.objects.get(user=request.user)
    serializer = ChatUserMinimalSerializer(data=request.data)
    if serializer.is_valid():
        requesting_user = ChatUser.objects.get(
            user__username=serializer.data.get("username")
        )
        if requesting_user is None:
            return Response(
                {"success": False, "message": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        chat_user.friends_list.friends.add(requesting_user)
        requesting_user.friends_list.requested_users.remove(chat_user)
        requesting_user.friends_list.friends.add(chat_user)
        with transaction.atomic():
            chat_user.friends_list.save()
            requesting_user.friends_list.save()

        # notify both parties of friends list change
        notify_friends_list_change(chat_user.pk)
        notify_friends_list_change(requesting_user.pk)

        return Response(
            {"success": True, "message": "Friend request accepted"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    description="Reject a friend request",
    request=ChatUserMinimalSerializer,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_friend_request(request):
    chat_user = ChatUser.objects.get(user=request.user)
    serializer = ChatUserMinimalSerializer(data=request.data)
    if serializer.is_valid():
        requested_user = ChatUser.objects.get(
            user__username=serializer.data.get("username")
        )
        if requested_user is None:
            return Response(
                {"success": False, "message": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        requested_user.friends_list.requested_users.remove(chat_user)
        requested_user.friends_list.save()

        # notify both parties of friends list change
        notify_friends_list_change(chat_user.pk)
        notify_friends_list_change(requested_user.pk)
        return Response(
            {"success": True, "message": "Friend request rejected"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    description="Create a chat with a list of users",
    request=ChatUsersMinimalSerializer,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_chat(request):
    chat_user = ChatUser.objects.get(user=request.user)
    serializer = ChatUsersMinimalSerializer(data=request.data)
    if serializer.is_valid():
        chat_users = ChatUser.objects.filter(
            user__username__in=serializer.data.get("usernames")
        )
        # check that we found all users
        if len(chat_users) != len(serializer.data.get("usernames")):
            return Response(
                {
                    "success": False,
                    f"message": "Some users not found. Looked for {len(serializer.data.get('usernames'))} users, found {len(chat_users)}",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        chat_users = [chat_user for chat_user in chat_users]
        chat_users.append(chat_user)
        new_chat = Chat.objects.create()
        new_chat.users.set(chat_users)
        new_chat.save()
        for chat_user_ in chat_users:
            notify_chat_list_change(chat_user_.pk)
        return Response(
            {"success": True, "message": "Chat created successfully"}
        )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    description="Get users that can be requested by the current user",
    responses={200: ChatUsersMinimalSerializer},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def requestable_users(request):
    chat_user = ChatUser.objects.get(user=request.user)
    usernames = (
        ChatUser.objects.exclude(pk=chat_user.pk)
        .exclude(pk__in=chat_user.friends_list.friends.all())
        .exclude(pk__in=chat_user.friends_list.requested_users.all())
    ).values_list("user__username", flat=True)
    serializer = ChatUsersMinimalSerializer(
        data={"usernames": usernames}
    )
    if serializer.is_valid():
        return Response(serializer.data)
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    description="Get messages between start_msg_number (inclusive) and end_msg_number (non-inclusive) for the chat with id chat_id",
    parameters=[
        OpenApiParameter(
            name="chat_id",
            type=int,
            location=OpenApiParameter.PATH,
            description="The id of the chat to get messages for",
        ),
        OpenApiParameter(
            name="start_msg_number",
            type=int,
            location=OpenApiParameter.QUERY,
            description="The start message number to get messages for",
        ),
        OpenApiParameter(
            name="end_msg_number",
            type=int,
            location=OpenApiParameter.QUERY,
            description="The end message number to get messages for",
        ),
    ],
    responses={
        200: MessageSerializer(many=True),
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, chat_id):
    """
    returns the messages between start_msg_number (inclusive)
    and end_msg_number (non-inclusive) for the chat with id chat_id
    """
    # validate request
    start_msg_number = request.query_params.get("start_msg_number", 0)
    end_msg_number = request.query_params.get("end_msg_number", -1)
    serializer = MessageRequestSerializer(
        data={
            "chat_id": chat_id,
            "start_msg_number": start_msg_number,
            "end_msg_number": end_msg_number,
        }
    )
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # else:
    chat_user = ChatUser.objects.get(user=request.user)
    chat = Chat.objects.filter(users=chat_user).get(pk=chat_id)
    if chat is None:
        return Response(
            {"success": False, "message": "Chat not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    # get messages
    start_msg_number = int(
        request.query_params.get("start_msg_number", 0)
    )
    end_msg_number = int(
        request.query_params.get("end_msg_number", -1)
    )
    messages = Message.objects.filter(chat=chat)
    # filter by start and end message number
    end_msg_number = (
        end_msg_number if end_msg_number != -1 else messages.count()
    )
    messages = messages.filter(
        message_number__gte=start_msg_number,
        message_number__lt=end_msg_number,
    ).order_by("message_number")
    response_serializer = MessageSerializer(messages, many=True)
    return Response(response_serializer.data)


@extend_schema(
    description="Get user info",
    responses={200: ChatUserSerializer},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    chat_user = ChatUser.objects.get(user=request.user)
    return Response(ChatUserSerializer(chat_user).data)


@extend_schema(
    description="Send a message to a chat",
    parameters=[
        OpenApiParameter(
            name="chat_id",
            type=int,
            location=OpenApiParameter.PATH,
            description="The id of the chat to send the message to",
        )
    ],
    request=NewMessageSerializer,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, chat_id):
    chat_user = ChatUser.objects.get(user=request.user)
    serializer = NewMessageSerializer(
        data=request.data,
    )
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
    # check user is in chat
    if not Chat.objects.get(pk=chat_id).users.get(pk=chat_user.pk):
        return Response(
            {"success": False, "message": "User not in chat"},
            status=status.HTTP_404_NOT_FOUND,
        )

    # should have an idempotent check here...

    message_count = Message.objects.filter(
        chat=Chat.objects.get(pk=chat_id)
    ).count()

    message = Message(
        chat=Chat.objects.get(pk=chat_id),
        sender=chat_user,
        text=serializer.data.get("text"),
        message_number=message_count,
    )
    message.save()
    message_data = MessageSerializer(message).data
    message_by_chat_data = MessageByChatSerializer(
        {"chat_id": chat_id, "message": message_data}
    ).data
    # notify users in chat of new message (and supply message)
    channel_layer = get_channel_layer()
    chat = Chat.objects.get(pk=chat_id)
    for chat_user in chat.users.all():
        print(f"sending message to group user_{chat_user.user.pk}")
        async_to_sync(channel_layer.group_send)(
            f"user_{chat_user.user.pk}",
            {"type": "chat_message", "payload": message_by_chat_data},
        )

    return Response(
        {"success": True, "message": "Message sent successfully"}
    )


@extend_schema(
    description="User exits chat",
    parameters=[
        OpenApiParameter(
            name="chat_id",
            type=int,
            location=OpenApiParameter.PATH,
            description="The id of the chat to exit",
        )
    ],
    request=None,
    responses={
        200: SuccessResponseSerializer,
        404: ErrorResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def exit_chat(request, chat_id):
    chat_user = ChatUser.objects.get(user=request.user)
    chat = Chat.objects.get(pk=chat_id)
    if chat.users.filter(pk=chat_user.pk).exists():
        chat.usersExited.add(chat_user)
        chat.save()
        chat_deleted: bool = chat.delete_if_all_users_exited()
        message = (
            "Chat exited and deleted"
            if chat_deleted
            else "Chat exited successfully"
        )
        for chat_user_ in chat.users.all():
            notify_chat_list_change(chat_user_.pk)
        return Response({"success": True, "message": message})

    else:
        return Response(
            {"success": False, "message": "User not in chat"},
            status=status.HTTP_404_NOT_FOUND,
        )
