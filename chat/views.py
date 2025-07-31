from django.shortcuts import render
from django.http import (
    HttpResponseRedirect as HTTPResponseRedirect,
)
from django.urls import reverse
from django.contrib.auth.views import LoginView, LogoutView
from chat.models import ChatUser, Chat, Message
from chat.forms import ChatForm, MessageForm


# Create your views here.
def home(request):
    chat_user = ChatUser.objects.get(user=request.user)
    chats = Chat.objects.filter(users=chat_user)
    add_chatForm = ChatForm(chat_user)
    return render(
        request,
        "home.html",
        {"chats": chats, "add_chatForm": add_chatForm},
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
                },
            )
    else:
        return HTTPResponseRedirect(reverse("home"))


def add_chat(request):
    if request.method == "POST":
        chat_user = ChatUser.objects.get(user=request.user)
        print((request.POST))
        form = ChatForm(chat_user, request.POST)
        print(form)
        if form.is_valid():
            chat = form.save()
            # print("chat added with users: ", chat.users.all())
        else:
            print("form not valid")
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
                message_number=message_number
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
    
def get_new_messages(request):
    pass


class ChatUserLoginView(LoginView):
    def get_success_url(self):
        return reverse("home")

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.request.user
        chatUser = ChatUser.objects.get(user=user)
        chatUser.loggedIn = True
        chatUser.save()
        return response


class ChatUserLogoutView(LogoutView):
    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.request.user
        chatUser = ChatUser.objects.get(user=user)
        chatUser.loggedIn = False
        chatUser.save()
        return response
