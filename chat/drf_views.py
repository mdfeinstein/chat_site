from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import ChatUser, Message, Chat
from .serializers import (
    ChatUserSerializer,
    FriendsListSerializer,
    MessageSerializer,
    ChatSerializer,
    ChatDataSerializer,
    ChatWithHistorySerializer,
    ChatsWithHistorySerializer,
)
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.db.models import Q, Max
from django.db.models.functions import Lower
import json
from drf_spectacular.utils import extend_schema, OpenApiParameter


@extend_schema(
    description="Get chat data for a specific chat",
    responses={200: ChatDataSerializer},
    #  parameters=[OpenApiParameter(name="chat_id", type=int, location=OpenApiParameter.QUERY)]
)
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
                "message": "Chat with this ID either does not exist or you are not a member"
            },
            status=status.HTTP_404_NOT_FOUND,
        )
    # get and order messages
    messages = chat.messages.order_by("message_number")
    serializer = ChatDataSerializer.from_chat(chat, messages)
    return Response(serializer.data)


@extend_schema(
    description="Get users chats with recent messages",
    responses={200: ChatsWithHistorySerializer},
    #  parameters=[OpenApiParameter(name="chat_id", type=int, location=OpenApiParameter.QUERY)]
)
@api_view(["GET"])
def get_chats_with_history(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = (
        Chat.objects.filter(users=chat_user)
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
