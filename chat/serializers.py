from rest_framework import serializers
from .models import ChatUser, Message, Chat, FriendsList


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatUser
        fields = ["id", "user", "loggedIn", "accountActive"]


class FriendsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendsList
        fields = ["id", "owner", "friends", "requested_users"]


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    messageNumber = serializers.IntegerField(source="message_number")

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "createdAt",
            "text",
            "messageNumber",
        ]


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = [
            "id",
            "users",
            "usersExited",
            "createdAt",
            "message_count",
        ]


class ChatDataSerializer(serializers.Serializer):
    chat_id = serializers.IntegerField()
    chat_name = serializers.CharField()
    messages = MessageSerializer(many=True)

    @classmethod
    def from_chat(cls, chat, messages):
        return cls(
            {
                "messages": messages,
                "chat_name": str(chat),
                "chat_id": chat.pk,
            }
        )

    # class Meta:
    #     fields = ["chat_id", "chat_name", "messages"]
