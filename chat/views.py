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


# Create your views here.
def home(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = Chat.objects.filter(users=chat_user).exclude(usersExited=chat_user)
    add_chatForm = ChatForm(chat_user)
    friends_list = chat_user.friends_list
    request_friends_form = RequestFriendsForm(chat_user)
    return render(
        request,
        "home.html",
        {"chats": chats, 
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
    chat_number = int(request.GET.get("chat_number"))
    message_form = MessageForm()
    if chat_number is not None:
        if chat_number < len(chats):
            chat = chats[chat_number]
            messages = Message.objects.filter(chat=chat)
            return render(
                request,
                "chat.html",
                {
                    "chat": chat,
                    "chat_number": chat_number,
                    "messages": messages,
                    "message_form": message_form,
                    "friends_list": chat_user.friends_list,
                },
            )
    else:
        return HTTPResponseRedirect(reverse("home"))


def add_chat(request):
    if request.method == "POST":
        chat_user = ChatUser.objects.get(user=request.user)
        form = ChatForm(chat_user, request.POST)
        if form.is_valid():
            chat = form.save()

    return HTTPResponseRedirect(reverse("home"))


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
    last_message_number = request.GET.get("last_message_number")
    messages = Message.objects.filter(
        chat=chat, message_number__gt=last_message_number
    ).order_by("message_number")
    # update last message number
    last_message_number = (
        messages.last().message_number
        if messages.last()
        else last_message_number
    )
    html = render_to_string(
        "_new_messages.html", {"messages": messages}
    )
    new_message_this_user = False
    for message in messages:
        if message.sender == chat_user:
            new_message_this_user = True
            break
    # render messages as html snippet using chat/message.html
    return JsonResponse(
        {
            "html": html,
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
    request_friends_form = RequestFriendsForm(chat_user, request.POST, instance = current_friends_list)
    if request_friends_form.is_valid():
        new_requests = set(request_friends_form.cleaned_data["requested_users"])
        old_requests = set(current_friends_list.requested_users.all())
        current_friends_list.requested_users.set(new_requests | old_requests)
        current_friends_list.save()
        current_friends_list.check_reciprocal_requests()
    
    return HTTPResponseRedirect(reverse("home"))

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
