import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatUser, Chat
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from asyncio import gather


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        print(f"user: {user}")
        if user is None or user.is_anonymous:
            await self.close()
            return
        self.room_name = self.scope["url_route"]["kwargs"]["chat_id"]
        ChatConsumer.validate_request(user, self.room_name)
        self.room_group_name = f"chat_{self.room_name}"
        print(f"attempting to join group {self.room_group_name}")
        # Join group
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        print("joined, about to accept...")
        protocols = self.scope.get("subprotocols", [])
        protocol = protocols[0] if protocols else None
        print(f"protocol: {protocols}")
        # echo back protocol to client to complete handshake
        await self.accept(
            subprotocol=protocol
        )  # Accept the WebSocket connection
        print("accepted")

    async def disconnect(self, close_code):
        # Leave group

        print(f"closed. Code: {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data):
        """Receive message from WebSocket and broadcast to group"""
        data = json.loads(text_data)
        message = data["message"]

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",  # maps to method name below
                "message": message,
            },
        )

    async def chat_message(self, event):
        """Receive message from group"""
        message = event["message"]

        # Send message to WebSocket client
        await self.send(text_data=json.dumps({"message": message}))

    @staticmethod
    @database_sync_to_async
    def validate_request(user, chat_id):
        """Validates that chat exists and user is in chat"""
        try:
            chat_user = ChatUser.objects.get(user=user)
        except ChatUser.DoesNotExist:
            return False
        try:
            chat = Chat.objects.get(pk=chat_id)
        except Chat.DoesNotExist:
            return False
        # finally, check that user is in chat
        return chat.users.filter(pk=chat_user.pk).exists()


class UserConsumer(AsyncWebsocketConsumer):
    @staticmethod
    @database_sync_to_async
    def change_login_status(user, loggedIn):
        chat_user = ChatUser.objects.get(user=user)
        chat_user.loggedIn = loggedIn
        chat_user.save()

    @staticmethod
    @database_sync_to_async
    def get_friends_ids(user):
        chat_user = ChatUser.objects.get(user=user)
        friends = chat_user.friends_list.friends.all()
        friends_ids = [friend.user.pk for friend in friends]
        return friends_ids

    async def connect(self):
        user = self.scope.get("user")
        print(f"user: {user}")
        if user is None or user.is_anonymous:
            await self.close()
            return

        self.room_group_name = f"user_{user.pk}"
        print(f"attempting to join group {self.room_group_name}")
        # Join group
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        print("joined, about to accept...")
        protocols = self.scope.get("subprotocols", [])
        protocol = protocols[0] if protocols else None
        print(f"protocol: {protocols}")
        # echo back protocol to client to complete handshake
        await self.accept(
            subprotocol=protocol
        )  # Accept the WebSocket connection
        print("accepted")
        # mark as online in db
        await UserConsumer.change_login_status(user, True)
        # alert friends
        friends_ids = await UserConsumer.get_friends_ids(user)
        alert_tasks = [
            self.channel_layer.group_send(
                f"user_{friend_id}",
                {
                    "type": "friends_list_change",
                    "payload": None,
                },
            )
            for friend_id in friends_ids
        ]
        await gather(*alert_tasks)

    async def disconnect(self, close_code):
        # Leave group
        print(f"closed. Code: {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )
        user = self.scope.get("user")
        await UserConsumer.change_login_status(user, False)
        print(f"user {user.username} disconnected")
        friends_ids = await UserConsumer.get_friends_ids(user)
        # alert friends about offline status
        alert_tasks = [
            self.channel_layer.group_send(
                f"user_{friend_id}",
                {
                    "type": "friends_list_change",
                    "payload": None,
                },
            )
            for friend_id in friends_ids
        ]
        await gather(*alert_tasks)

    async def receive(self, text_data):
        """Handle incoming messages from the client"""
        try:
            event = json.loads(text_data)
            message_type = event.get("type")

            if message_type == "send_typing":
                await self.send_typing(event)
            else:
                print(f"Unknown message type: {message_type}")
        except json.JSONDecodeError as e:
            print(f"Invalid JSON received: {e}")
        except Exception as e:
            print(f"Error handling message: {e}")

    async def chat_message(self, event):
        """Receive message from group"""
        # Send message to WebSocket client
        print(f"message received: {event['payload']}")
        await self.send(
            text_data=json.dumps(
                {"type": event["type"], "payload": event["payload"]}
            )
        )

    async def friends_list_change(self, event):
        """tell user that friends list change has occured"""
        # Send message to WebSocket client
        print("friends_list_change received")
        await self.send(
            text_data=json.dumps(
                {"type": event["type"], "payload": event["payload"]}
            )
        )

    async def chat_list_change(self, event):
        """tell user that chat list change has occured"""
        # Send message to WebSocket client
        print("chat_list_change received")
        await self.send(
            text_data=json.dumps(
                {"type": event["type"], "payload": event["payload"]}
            )
        )

    @staticmethod
    @database_sync_to_async
    def get_username_from_user_id(user_id):
        try:
            user = User.objects.get(pk=user_id)
        except ChatUser.DoesNotExist:
            return None
        return user.username

    async def is_typing(self, event):
        """reports to users in chat that user is typing
        expected payload: {"chat_id": int, "user_id": int, "user_name": str}
        """
        print("is_typing received")
        await self.send(
            text_data=json.dumps(
                {"type": event["type"], "payload": event["payload"]}
            )
        )

    @staticmethod
    @database_sync_to_async
    def get_other_users_in_chat(chat_id, user_id):
        chat = Chat.objects.get(pk=chat_id)
        chat_users = chat.users.exclude(user__pk=user_id)
        return [chat_user.user.pk for chat_user in chat_users]

    async def send_typing(self, event):
        """broadcasts to users in chat that user is typing
        expected payload: {"chat_id": int, "user_id": int}
        """
        print("send_typing received")
        user = self.scope.get("user")
        username = await UserConsumer.get_username_from_user_id(
            user.pk
        )
        other_users = await UserConsumer.get_other_users_in_chat(
            event["payload"]["chat_id"], user.pk
        )
        event["payload"]["user_name"] = username
        print(f"other users: {other_users}")
        send_tasks = [
            self.channel_layer.group_send(
                f"user_{user_id}",
                {
                    "type": "is_typing",
                    "payload": event["payload"],
                },
            )
            for user_id in other_users
        ]
        await gather(*send_tasks)
