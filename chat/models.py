from django.db import models, ValidationError
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

class FriendsList(models.Model):
    owner = models.OneToOneField(ChatUser, on_delete=models.CASCADE)
    friends = models.ManyToManyField(ChatUser, related_name='friends_of') 
    requested_users = models.ManyToManyField(ChatUser, related_name='requested_by')

    def __str__(self):
        #comma separated list of users
        friends = ', '.join(f'{user}' for user in self.friends.all()) 
        requested_users = ', '.join(f'{user}' for user in self.requested_users.all()) 
        s = f'friends: {friends}\nrequested_users: {requested_users}'
        return s
    
    def clean(self):
        if self.owner in self.friends.all():
            raise ValidationError("You cannot add yourself as a friend.")
        if self.owner in self.requested_users.all():
            raise ValidationError("You cannot request yourself.")
        #check that there is not overlap between requested users and friends
        if len(self.friends.all() & self.requested_users.all()) > 0:
            raise ValidationError("You cannot request a user that is already a friend.")
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

