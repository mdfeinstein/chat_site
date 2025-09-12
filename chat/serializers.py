from rest_framework import serializers
from .models import ChatUser, Message, Chat, FriendsList


class AuthTokenRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class AuthTokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField(read_only=True)


class AuthErrorResponseSerializer(serializers.Serializer):
    non_field_errors = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    username = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    password = serializers.ListField(
        child=serializers.CharField(), required=False
    )


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

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "createdAt",
            "text",
            "message_number",
        ]


class NewMessageSerializer(serializers.Serializer):
    text = serializers.CharField()


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
    chat_usernames = serializers.ListField(
        child=serializers.CharField()
    )
    exited_chat_usernames = serializers.ListField(
        child=serializers.CharField()
    )
    messages = MessageSerializer(many=True)

    @classmethod
    def from_chat(cls, chat, messages):
        chat_usernames = [
            chat_user.user.username for chat_user in chat.users.all()
        ]
        exited_chat_usernames = [
            chat_user.user.username
            for chat_user in chat.usersExited.all()
        ]
        return cls(
            {
                "chat_id": chat.pk,
                "chat_usernames": chat_usernames,
                "exited_chat_usernames": exited_chat_usernames,
                "messages": messages,
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
