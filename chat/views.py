from django.shortcuts import render
from django.http import (
    HttpResponseRedirect as HTTPResponseRedirect,
)
from django.urls import reverse
from django.contrib.auth.views import LoginView, LogoutView
from chat.models import ChatUser, Chat, Message
from chat.forms import ChatForm, MessageForm, RequestFriendsForm
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.db.models import Max, F
import json


# Create your views here.
def home(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = Chat.objects.filter(users=chat_user).exclude(
        usersExited=chat_user
    )
    add_chatForm = ChatForm(chat_user)
    friends_list = chat_user.friends_list
    request_friends_form = RequestFriendsForm(chat_user)
    return render(
        request,
        "home.html",
        {
            "chats": chats,
            "add_chatForm": add_chatForm,
            "friends_list": friends_list,
            "request_friends_form": request_friends_form,
            "chat_user": chat_user,
        },
    )


def login(request):
    # if authenticated, redirect to home
    if request.user.is_authenticated:
        return HTTPResponseRedirect(reverse("home"))
    else:
        return render(request, "login.html")


def redirect_to_login_or_home(request):
    if request.user.is_authenticated:
        return HTTPResponseRedirect(reverse("home"))
    else:
        return HTTPResponseRedirect(reverse("login"))


def chat(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = Chat.objects.filter(users=chat_user)
    if request.GET.get("chat_number") is not None:
        chat_number = int(request.GET.get("chat_number"))
        if chat_number < len(chats):
            chat = chats[chat_number]
            messages = Message.objects.filter(chat=chat)
            chat_found = True
    if request.GET.get("chat_id") is not None:
        chat_id = int(request.GET.get("chat_id"))
        chat = Chat.objects.get(pk=chat_id)
        messages = Message.objects.filter(chat=chat)
        chat_found = True
    else:
        chat_found = False
    message_form = MessageForm()
    if chat_found:
        return render(
            request,
            "chat.html",
            {
                "chat": chat,
                # "chat_number": chat_number,
                "messages": messages,
                "message_form": message_form,
                "friends_list": chat_user.friends_list,
            },
        )
    else:
        return HTTPResponseRedirect(reverse("home"))


def chat_page(request):
    # default to chat with most recent message
    chat_user = ChatUser.objects.get(user=request.user)
    most_recent_message = (
        Message.objects.filter(chat__users=chat_user)
        .order_by("-createdAt")
        .first()
    )
    if most_recent_message:
        chat_pk = most_recent_message.chat.pk
    else:
        chat_pk = -1
    return render(
        request,
        "chat.html",
        {"chat_pk": chat_pk},
    )


def add_chat(request):
    if request.method == "POST":
        chat_user = ChatUser.objects.get(user=request.user)
        try:
            # data is a list of user names
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON"},
                status=400,
            )
        chat_users = ChatUser.objects.filter(
            user__username__in=data["requested_user_names"]
        )
        chat_users = [chat_user for chat_user in chat_users]
        chat_users.append(chat_user)
        print(chat_users)
        new_chat = Chat.objects.create()
        new_chat.users.set(chat_users)
        new_chat.save()
        return JsonResponse(
            {"success": True, "message": "Chat added successfully"}
        )

    return JsonResponse(
        {"success": True, "message": "Chat added successfully"}
    )


def send_message(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = Chat.objects.filter(users=chat_user)
    chat_number = int(request.POST.get("chat_number"))
    message_form = MessageForm(request.POST)
    if chat_number is not None:
        if chat_number < len(chats):
            chat = chats[chat_number]
            message_number = chat.message_count
            message = Message(
                chat=chat,
                sender=chat_user,
                text=request.POST.get("text"),
                message_number=message_number,
            )
            message.save()
            chat.message_count = message_number + 1
            chat.save()
            # reload same page
            return HTTPResponseRedirect(
                reverse("chat") + "?chat_number=" + str(chat_number)
            )
    else:
        return HTTPResponseRedirect(reverse("home"))


def send_message_async(request):
    chat_id = request.POST.get("chat_id")
    chat_user = ChatUser.objects.get(user=request.user)
    chat = Chat.objects.filter(users=chat_user).get(pk=chat_id)
    # chat_number = int(request.POST.get("chat_number"))
    if chat is not None:
        message_number = chat.message_count
        message = Message(
            chat=chat,
            sender=chat_user,
            text=request.POST.get("text"),
            message_number=message_number,
        )
        message.save()
        chat.message_count = message_number + 1
        chat.save()
    # respond with success
    return JsonResponse({"success": True})


def get_new_messages(request):
    chat_id = request.GET.get("chat_pk")
    chat = Chat.objects.get(pk=chat_id)
    # validate requesting user is in chat
    chat_user = ChatUser.objects.get(user=request.user)
    if chat_user not in chat.users.all():
        return HTTPResponseRedirect(reverse("home"))
    # get new messages
    last_message_number = int(request.GET.get("last_message_number"))
    messages = Message.objects.filter(
        chat=chat, message_number__gt=last_message_number
    ).order_by("message_number")
    # update last message number
    last_message_number = (
        messages.last().message_number
        if messages.last()
        else last_message_number
    )
    new_message_this_user = False
    message_dicts: list[dict] = []

    print(messages.last())
    for message in messages:
        message_dict = {}
        if message.sender == chat_user:
            new_message_this_user = True
        message_dict["id"] = message.id
        message_dict["sender"] = message.sender.user.username
        message_dict["created_at"] = message.createdAt
        message_dict["text"] = message.text
        message_dict["message_number"] = message.message_number
        message_dicts.append(message_dict)

    return JsonResponse(
        {
            "messages": message_dicts,
            "last_message_number": last_message_number,
            "new_message_this_user": new_message_this_user,
        }
    )


def exit_chat(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chat_pk = int(request.POST.get("chat_pk"))
    chat = Chat.objects.get(pk=chat_pk)
    chat.usersExited.add(chat_user)
    chat.save()
    if chat.usersExited.count() == chat.users.count():
        chat.delete()
    return HTTPResponseRedirect(reverse("home"))


def request_friends(request):
    chat_user = ChatUser.objects.get(user__pk=request.user.pk)
    current_friends_list = chat_user.friends_list
    request_friends_form = RequestFriendsForm(
        chat_user, request.POST, instance=current_friends_list
    )
    if request_friends_form.is_valid():
        new_requests = set(
            request_friends_form.cleaned_data["requested_users"]
        )
        old_requests = set(current_friends_list.requested_users.all())
        current_friends_list.requested_users.set(
            new_requests | old_requests
        )
        current_friends_list.save()
        current_friends_list.check_reciprocal_requests()

    return HTTPResponseRedirect(reverse("home"))


def request_friend(request):
    data = json.loads(request.body)
    print(data)
    chat_user = ChatUser.objects.get(user__pk=request.user.pk)
    try:
        print(int(data.get("requested_user_pk")))
        requested_user = ChatUser.objects.get(
            pk=int(data.get("requested_user_pk"))
        )
    except ChatUser.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "User not found"}
        )
    # check if friend is already in the list
    if requested_user in chat_user.friends_list.friends.all():
        return JsonResponse(
            {"success": False, "message": "Friend already in list"}
        )
    # is requested_user already requested this user, transfer to friend list
    elif (
        chat_user in requested_user.friends_list.requested_users.all()
    ):
        requested_user.friends_list.friends.add(chat_user)
        requested_user.friends_list.requested_users.remove(chat_user)
        requested_user.friends_list.save()
        chat_user.friends_list.friends.add(requested_user)
        chat_user.freinds_list.save()
        return JsonResponse(
            {"success": True, "message": "Friend added"}
        )
    else:
        # add requesteD_user to requested_users
        chat_user.friends_list.requested_users.add(requested_user)
        chat_user.friends_list.save()
        return JsonResponse(
            {"success": True, "message": "Request sent"}
        )


def cancel_request(request):
    chat_user = ChatUser.objects.get(user__pk=request.user.pk)
    data = json.loads(request.body)  # request
    chat_user.friends_list.requested_users.remove(
        ChatUser.objects.get(
            user__username=data.get("requested_user_name")
        )
    )
    chat_user.friends_list.save()
    return JsonResponse(
        {"success": True, "message": "Request cancelled"}
    )


def get_requestable_users(request):
    """
    Returns a list of users that can be requested by the current user
    """
    chat_user = ChatUser.objects.get(user=request.user)
    users = (
        ChatUser.objects.exclude(pk=chat_user.pk)
        .exclude(pk__in=chat_user.friends_list.friends.all())
        .exclude(pk__in=chat_user.friends_list.requested_users.all())
    )
    user_dict = [
        {"name": user.user.username, "pk": user.pk} for user in users
    ]
    return JsonResponse({"users": user_dict})


def get_chats(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = Chat.objects.filter(users=chat_user)
    chat_dicts = []
    for chat in chats:
        chat_dict = {}
        chat_dict["id"] = chat.pk
        chat_dict["name"] = str(chat)
        chat_dict["link"] = (
            reverse("get_chat_data") + "?chat_id=" + str(chat.pk)
        )

        last_message = chat.messages.order_by("message_number").last()
        chat_dict["lastMessage"] = (
            last_message.text if last_message is not None else ""
        )
        chat_dict["lastMessageAuthor"] = (
            last_message.sender.user.username
            if last_message is not None
            else ""
        )
        chat_dict["lastMessageDate"] = (
            last_message.createdAt.isoformat()
            if last_message is not None
            else ""
        )
        chat_dicts.append(chat_dict)

    print(chat_dicts)

    return JsonResponse(chat_dicts, safe=False)


def get_chats_with_history(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = (
        Chat.objects.filter(users=chat_user)
        .annotate(last_message_time=Max("messages__createdAt"))
        .order_by("-last_message_time")
    )
    chat_dicts = []
    for chat in chats:
        chat_dict = {}
        chat_dict["id"] = chat.pk
        chat_dict["name"] = str(chat)
        chat_dict["link"] = (
            reverse("get_chat_data") + "?chat_id=" + str(chat.pk)
        )

        last_messages = chat.messages.order_by("-message_number")[:10]
        # last_messages.sort(key=lambda msg: msg.createdAt)
        chat_dict["lastMessages"] = [
            last_message.text if last_message is not None else ""
            for last_message in last_messages
        ]
        chat_dict["lastMessagesAuthors"] = [
            (
                last_message.sender.user.username
                if last_message is not None
                else ""
            )
            for last_message in last_messages
        ]
        chat_dict["lastMessagesDates"] = [
            (
                last_message.createdAt.isoformat()
                if last_message is not None
                else ""
            )
            for last_message in last_messages
        ]
        chat_dicts.append(chat_dict)

    print(chat_dicts)

    return JsonResponse(chat_dicts, safe=False)


def get_friend_info(request):
    chat_user = ChatUser.objects.get(user=request.user)
    friend_list = chat_user.friends_list
    friend_dicts = []
    for friend in friend_list.friends.all():
        friend_dict = {}
        friend_dict["status"] = "friend"
        friend_dict["name"] = friend.user.username
        friend_dict["online"] = friend.loggedIn
        friend_dicts.append(friend_dict)

    for friend in friend_list.requested_users.all():
        friend_dict = {}
        friend_dict["status"] = "requestedByUser"
        friend_dict["name"] = friend.user.username
        friend_dict["online"] = friend.loggedIn
        friend_dicts.append(friend_dict)
    # filter and find incoming requests
    invited_by_lists = chat_user.requested_by.all()
    for invited_by_list in invited_by_lists:
        friend_dict = {}
        friend_dict["status"] = "requestedByOther"
        friend_dict["name"] = invited_by_list.owner.user.username
        friend_dict["online"] = invited_by_list.owner.loggedIn
        friend_dicts.append(friend_dict)

    return JsonResponse(friend_dicts, safe=False)


def get_chat_data(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chat_id = request.GET.get("chat_id")
    chat = Chat.objects.get(pk=chat_id)
    messages = Message.objects.filter(chat=chat).order_by(
        "message_number"
    )
    message_dicts = []
    for message in messages:
        message_dict = {}
        message_dict["id"] = message.id
        message_dict["sender"] = message.sender.user.username
        message_dict["createdAt"] = message.createdAt.isoformat()
        message_dict["text"] = message.text
        message_dict["messageNumber"] = message.message_number
        message_dicts.append(message_dict)
    return JsonResponse(
        {
            "messages": message_dicts,
            "chat_name": str(chat),
            "chat_id": chat.pk,
        }
    )


def accept_invite(request):
    chat_user = ChatUser.objects.get(user=request.user)
    data = json.loads(request.body)
    print(data)
    try:
        inviting_user = ChatUser.objects.get(
            user__username=data.get("requesting_user_name")
        )
    except ChatUser.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "User not found"}
        )
    inviting_user.friends_list.requested_users.remove(chat_user)
    inviting_user.friends_list.friends.add(chat_user)
    chat_user.friends_list.friends.add(inviting_user)
    chat_user.friends_list.save()
    inviting_user.friends_list.save()
    return JsonResponse(
        {"success": True, "message": "Invite accepted"}
    )


def reject_invite(request):
    chat_user = ChatUser.objects.get(user=request.user)
    data = json.loads(request.body)
    print(data)
    try:
        inviting_user = ChatUser.objects.get(
            user__username=data.get("requesting_user_name")
        )
    except ChatUser.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "User not found"}
        )
    inviting_user.friends_list.requested_users.remove(chat_user)
    inviting_user.friends_list.save()
    return JsonResponse(
        {"success": True, "message": "Invite rejected"}
    )


class ChatUserLoginView(LoginView):
    def get_success_url(self):
        return reverse("home")

    def form_valid(self, form):
        response = super().form_valid(form)
        if self.request.user.is_authenticated:
            chatUser = ChatUser.objects.get(user=self.request.user)
            chatUser.loggedIn = True
            chatUser.save()

        return response

    def form_invalid(self, form):
        response = super().form_invalid(form)
        return response


class ChatUserLogoutView(LogoutView):

    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            chatUser = ChatUser.objects.get(user=request.user)
            chatUser.loggedIn = False
            chatUser.save()
        return super().post(request, *args, **kwargs)
