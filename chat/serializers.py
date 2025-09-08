from rest_framework import serializers
from .models import ChatUser, Message, Chat, FriendsList


class SuccessResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()


class ErrorResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=False)
    message = serializers.CharField()


class ChatUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")

    class Meta:
        model = ChatUser
        fields = [
            "id",
            "username",
            "loggedIn",
            "accountActive",
        ]


class ChatUserMinimalSerializer(serializers.Serializer):
    # assume username is unique right now
    username = serializers.CharField()


class ChatUsersMinimalSerializer(serializers.Serializer):
    usernames = serializers.ListField(child=serializers.CharField())


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


class MessagesSerializer(serializers.Serializer):
    messages = MessageSerializer(many=True)


class MessageRequestSerializer(serializers.Serializer):
    chat_id = serializers.IntegerField()
    start_msg_number = serializers.IntegerField()
    end_msg_number = serializers.IntegerField()


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


class FriendDataSerializer(serializers.Serializer):
    online_friends = ChatUserSerializer(many=True)
    offline_friends = ChatUserSerializer(many=True)
    requested_users = ChatUserSerializer(many=True)
    invited_by = ChatUserSerializer(many=True)
