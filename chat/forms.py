from chat.models import Chat, Message, ChatUser, FriendsList
from django.forms import ModelForm
from django import forms
from django.contrib.auth import get_user_model


class ChatForm(ModelForm):
    def __init__(self, chat_user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chat_user = chat_user
        self.fields["users"].queryset = self.fields[
            "users"
        ].queryset.exclude(pk=chat_user.pk)

    def clean(self):
        cleaned_data = super().clean()
        users = cleaned_data.get("users")
        if users:
            # Example: add or remove users
            cleaned_data["users"] = users | ChatUser.objects.filter(
                pk=self.chat_user.pk
            )

    users = forms.ModelMultipleChoiceField(
        queryset=ChatUser.objects.all(),
        widget=forms.SelectMultiple(attrs={"size": 10}),
        label="Select Users",
    )

    class Meta:
        model = Chat
        fields = ["users"]


class MessageForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["text"].label = ""
        self.fields["text"].widget.attrs.update(
            {
                "placeholder": "Type message here...",
                "class": "chat-textarea",
            }
        )

    class Meta:
        model = Message
        fields = ["text"]
        widgets = {
            "text": forms.Textarea(attrs={"rows": 1}),
        }


class RequestFriendsForm(ModelForm):
    def __init__(self, owner, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.owner = owner
        self.fields["requested_users"].queryset = (
            self.fields["requested_users"]
            .queryset.exclude(pk=self.owner.pk)
            .exclude(pk__in=self.owner.friends_list.friends.all())
            .exclude(pk__in=self.owner.friends_list.requested_users.all())
        )

    requested_users = forms.ModelMultipleChoiceField(
        queryset=ChatUser.objects.all(),
        widget=forms.SelectMultiple(attrs={"size": 10}),
        label="Select Users",
    )

    class Meta:
        model = FriendsList
        fields = ["requested_users"]
