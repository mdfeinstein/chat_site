from django.contrib import admin
from chat.models import ChatUser, Chat, Message, FriendsList

# Register your models here.
#register ChatUser, Chat, and Message models
admin.site.register(ChatUser)
admin.site.register(Chat)
admin.site.register(Message)
admin.site.register(FriendsList)