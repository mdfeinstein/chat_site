from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def notify_friends_list_change(chat_user_id):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{chat_user_id}",
        {
            "type": "friends_list_change",
            "payload": None,
        },
    )
