from rest_framework.routers import DefaultRouter
from .drf_views import get_chat_data

api_router = DefaultRouter()
api_router.register(r"chat_data", get_chat_data, basename="chat_data")
