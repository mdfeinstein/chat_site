import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join group
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )

        await self.accept()  # Accept the WebSocket connection

    async def disconnect(self, close_code):
        # Leave group
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
