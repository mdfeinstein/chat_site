import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatUser, Chat
from channels.db import database_sync_to_async


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
