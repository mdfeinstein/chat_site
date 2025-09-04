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
)
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.db.models import Q
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
