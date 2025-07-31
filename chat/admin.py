from django.contrib import admin
from chat.models import ChatUser, Chat, Message

# Register your models here.
#register ChatUser, Chat, and Message models
admin.site.register(ChatUser)
admin.site.register(Chat)
admin.site.register(Message)