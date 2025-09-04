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
    messageNumber = serializers.IntegerField(
        source="message_number", read_only=True
    )

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


class ChatWithHistorySerializer(serializers.Serializer):
    chat_id = serializers.IntegerField()
    chat_name = serializers.CharField()
    last_messages = MessageSerializer(many=True)

    @classmethod
    def from_chat_and_last_messages(cls, chat, last_messages):
        return cls(
            {
                "chat_id": chat.pk,
                "chat_name": str(chat),
                "last_messages": last_messages,
            }
        )


class ChatsWithHistorySerializer(serializers.Serializer):
    chats = ChatWithHistorySerializer(many=True)
