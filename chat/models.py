from django.db import models
from django.contrib.auth.models import User

# Create your models here.
#add chat User which has a user, a loggedIn status, and an accountActive status
class ChatUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    loggedIn = models.BooleanField(default=False)
    accountActive = models.BooleanField(default=True)

    def __repr__(self):
        return f'{self.user.username}'
    def __str__(self):
        return f'{self.user.username}'

class Chat(models.Model):
    users = models.ManyToManyField(ChatUser, related_name='chats')
    usersExited = models.ManyToManyField(ChatUser, related_name='chatsExited')
    createdAt = models.DateTimeField(auto_now_add=True)
    message_count = models.IntegerField(default=0)

    def __str__(self):
        #comma separated list of users
        s = ', '.join(f'{user}' for user in self.users.all()) 
        return s
    def __repr__(self):
        return self.__str__()

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(ChatUser, on_delete=models.CASCADE)
    text = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)
    message_number = models.IntegerField(default=0)
