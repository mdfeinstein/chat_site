from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

from django.db.models.signals import post_save
from django.dispatch import receiver


# Create your models here.
# add chat User which has a user, a loggedIn status, and an accountActive status
class ChatUser(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="chat_user"
    )
    loggedIn = models.BooleanField(default=False)
    accountActive = models.BooleanField(default=True)

    def __repr__(self):
        return f"{self.user.username}"

    def __str__(self):
        return f"{self.user.username}"


class Chat(models.Model):
    users = models.ManyToManyField(ChatUser, related_name="chats")
    usersExited = models.ManyToManyField(
        ChatUser, related_name="chatsExited"
    )
    createdAt = models.DateTimeField(auto_now_add=True)
    message_count = models.IntegerField(default=0)

    def __str__(self):
        # comma separated list of users
        s = ", ".join(f"{user}" for user in self.users.all())
        return s

    def __repr__(self):
        return self.__str__()

    def delete_if_all_users_exited(self):
        if self.usersExited.count() == self.users.count():
            self.delete()
            return True
        else:
            return False


class Message(models.Model):
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name="messages",
        db_index=True,
    )
    sender = models.ForeignKey(ChatUser, on_delete=models.CASCADE)
    text = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)
    message_number = models.IntegerField()


class FriendsList(models.Model):
    owner = models.OneToOneField(
        ChatUser,
        on_delete=models.CASCADE,
        related_name="friends_list",
    )
    friends = models.ManyToManyField(
        ChatUser, related_name="friends_of"
    )
    requested_users = models.ManyToManyField(
        ChatUser, related_name="requested_by"
    )

    def __str__(self):
        if self.pk is None:
            return "No friends list"
        # comma separated list of users
        friends = ", ".join(f"{user}" for user in self.friends.all())
        requested_users = ", ".join(
            f"{user}" for user in self.requested_users.all()
        )
        s = f"friends: {friends}\nrequested_users: {requested_users}"
        return s

    def clean(self):
        # check for pk
        if self.pk is None:
            return
        if self.owner in self.friends.all():
            raise ValidationError(
                "You cannot add yourself as a friend."
            )
        if self.owner in self.requested_users.all():
            raise ValidationError("You cannot request yourself.")
        # check that there is not overlap between requested users and friends
        if len(self.friends.all() & self.requested_users.all()) > 0:
            raise ValidationError(
                "You cannot request a user that is already a friend."
            )

    def save(self, *args, **kwargs):
        self.full_clean(exclude=["friends", "requested_users"])
        super().save(*args, **kwargs)

    def check_reciprocal_requests(self):
        for user in self.requested_users.all():
            their_friendslist = user.friends_list
            if self.owner in user.friends_list.requested_users.all():
                self.requested_users.remove(user)
                self.friends.add(user)
                their_friendslist.requested_users.remove(self.owner)
                their_friendslist.friends.add(self.owner)
                their_friendslist.save()
                self.save()


@receiver(post_save, sender=ChatUser)
def create_friends_list(sender, instance, created, **kwargs):
    if created:
        FriendsList.objects.create(owner=instance)
