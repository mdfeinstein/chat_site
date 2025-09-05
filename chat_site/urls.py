"""
URL configuration for chat_site project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
import chat.views
import chat.drf_views
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/swagger/",
        SpectacularSwaggerView.as_view(),
        name="swagger",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(), name="redoc"),
    # Make chat_id optional by using a path converter with default value
    path(
        "api/get_chat_data/",
        chat.drf_views.get_chat_data,
        name="get_chat_data_api_no_id",
    ),
    path(
        "api/get_chat_data/<int:chat_id>/",
        chat.drf_views.get_chat_data,
        name="get_chat_data_api",
    ),
    path(
        "api/get_chats_with_history/",
        chat.drf_views.get_chats_with_history,
        name="get_chats_with_history_api",
    ),
    path(
        "api/get_friend_data/",
        chat.drf_views.friends_list,
        name="get_friend_data_api",
    ),
    path(
        "api/send_request/",
        chat.drf_views.send_request,
        name="send_request_api",
    ),
    path(
        "api/cancel_request/",
        chat.drf_views.cancel_request,
        name="cancel_request_api",
    ),
    path(
        "api/accept_friend_request/",
        chat.drf_views.accept_friend_request,
        name="accept_friend_request_api",
    ),
    path(
        "api/reject_friend_request/",
        chat.drf_views.reject_friend_request,
        name="reject_friend_request_api",
    ),
    path("", chat.views.redirect_to_login_or_home, name="landing"),
    path("login", chat.views.login, name="login"),
    path(
        "login_request",
        chat.views.ChatUserLoginView.as_view(
            template_name="login.html", next_page="home"
        ),
        name="login_request",
    ),
    path(
        "home", chat.views.home, name="home"
    ),  # chat list, friends list, logout button
    path("chat", chat.views.chat, name="chat"),
    path("chat_page", chat.views.chat_page, name="chat_page"),
    path(
        "logout",
        chat.views.ChatUserLogoutView.as_view(
            template_name="logout.html"
        ),
        name="logout",
    ),
    path("add_chat", chat.views.add_chat, name="add_chat"),
    path(
        "send_message", chat.views.send_message, name="send_message"
    ),
    path(
        "send_message_async",
        chat.views.send_message_async,
        name="send_message_async",
    ),
    path(
        "get_new_messages",
        chat.views.get_new_messages,
        name="get_new_messages",
    ),
    path("exit_chat", chat.views.exit_chat, name="exit_chat"),
    path(
        "request_friends",
        chat.views.request_friends,
        name="request_friends",
    ),
    path(
        "request_friend",
        chat.views.request_friend,
        name="request_friend",
    ),
    path(
        "get_requestable_users",
        chat.views.get_requestable_users,
        name="get_requestable_users",
    ),
    path("get_chats", chat.views.get_chats, name="get_chats"),
    path(
        "get_friend_info",
        chat.views.get_friend_info,
        name="get_friend_info",
    ),
    path(
        "get_chat_data",
        chat.views.get_chat_data,
        name="get_chat_data",
    ),
    path(
        "get_chats_with_history",
        chat.views.get_chats_with_history,
        name="get_chats_with_history",
    ),
    path(
        "cancel_request",
        chat.views.cancel_request,
        name="cancel_request",
    ),
    path(
        "accept_invite",
        chat.views.accept_invite,
        name="accept_invite",
    ),
    path(
        "reject_invite",
        chat.views.reject_invite,
        name="reject_invite",
    ),
]
