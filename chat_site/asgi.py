import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing  # import websocket routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chat_site.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),  # traditional HTTP requests
        "websocket": AuthMiddlewareStack(
            URLRouter(chat.routing.websocket_urlpatterns)
        ),
    }
)
