from django.test import TestCase
from chat.models import ChatUser, Chat, Message, FriendsList
from django.contrib.auth.models import User
from django.test import Client
from django.urls import reverse
from bs4 import BeautifulSoup
# from django.contrib.auth import get_user_model
# from django.contrib.sessions.middleware import SessionMiddleware


# Create your tests here.
class TestChatUser(TestCase):
    def setUp(self):
        # create django user
        self.user = User.objects.create_user(
            username="test", password="test"
        )
        self.chat_user = ChatUser.objects.create(
            user=self.user, loggedIn=False
        )

    def test_creation_of_chat_user(self):
        self.assertFalse(
            self.chat_user.loggedIn,
            f"before refresh: {self.chat_user.loggedIn}",
        )
        self.chat_user.refresh_from_db()
        # self.user.refresh_from_db()
        self.assertEqual(self.chat_user.__str__(), "test")
        self.assertTrue(self.chat_user.accountActive)
        self.assertFalse(
            self.chat_user.loggedIn,
            f"after refresh: {self.chat_user.loggedIn}",
        )

    def test_invalid_login(self):
        self.chat_user.refresh_from_db()
        self.user.refresh_from_db()
        self.assertFalse(
            self.chat_user.loggedIn, "before attempt, after refresh"
        )
        response = self.client.post(
            "/login_request",
            {"username": "test", "password": "wrong"},
            follow=True,
        )
        self.chat_user.refresh_from_db()
        self.user.refresh_from_db()
        self.assertFalse("_auth_user_id" in self.client.session)
        self.assertFalse(self.chat_user.loggedIn)

    def test_friendslist_created(self):
        friends_list = FriendsList.objects.get(owner=self.chat_user)
        self.assertIsNotNone(friends_list)

    def test_valid_login_and_logout(self):
        with self.subTest("test login"):
            response = self.client.post(
                "/login_request",
                {"username": "test", "password": "test"},
            )
            self.chat_user.refresh_from_db()
            self.assertEqual(response.status_code, 302)
            self.assertTrue("_auth_user_id" in self.client.session)
            self.assertEqual(
                int(self.client.session["_auth_user_id"]),
                self.user.id,
            )
            self.assertTrue(self.chat_user.loggedIn)
        with self.subTest("test logout"):
            response = self.client.post("/logout")
            self.chat_user.refresh_from_db()
            self.user.refresh_from_db()
            self.assertEqual(response.status_code, 200)
            self.assertFalse("_auth_user_id" in self.client.session)
            self.assertFalse(self.chat_user.loggedIn)


class TestFriends(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test", password="test"
        )
        self.chat_user = ChatUser.objects.create(
            user=self.user, loggedIn=False
        )
        self.user1 = User.objects.create_user(
            username="test1", password="test1"
        )
        self.chat_user1 = ChatUser.objects.create(user=self.user1)
        self.client0 = Client()
        self.client0.post(
            "/login_request", {"username": "test", "password": "test"}
        )
        self.client1 = Client()
        self.client1.post(
            "/login_request",
            {"username": "test1", "password": "test1"},
        )

    def check_logged_in(self):
        self.assertTrue("_auth_user_id" in self.client0.session)
        self.assertTrue("_auth_user_id" in self.client1.session)

    def test_request_friends(self):
        with self.subTest("user 0 requests user 1"):
            response0 = self.client0.post(
                "/request_friends",
                {"requested_users": [self.chat_user1.pk]},
            )
            self.chat_user.refresh_from_db()
            self.assertTrue(
                self.chat_user1
                in self.chat_user.friends_list.requested_users.all()
            )
            self.assertFalse(
                self.chat_user1
                in self.chat_user.friends_list.friends.all()
            )

        with self.subTest("user 1 requests user 0"):
            response1 = self.client1.post(
                "/request_friends",
                {"requested_users": [self.chat_user.pk]},
            )
            self.chat_user1.refresh_from_db()
            self.chat_user.refresh_from_db()
            # since request reciprocal, both users should be friends and not in requested users
            self.assertFalse(
                self.chat_user
                in self.chat_user1.friends_list.requested_users.all()
            )
            self.assertFalse(
                self.chat_user1
                in self.chat_user.friends_list.requested_users.all()
            )
            # should both be friends
            self.assertTrue(
                self.chat_user
                in self.chat_user1.friends_list.friends.all()
            )
            self.assertTrue(
                self.chat_user1
                in self.chat_user.friends_list.friends.all()
            )

        with self.subTest("user 0 requests user 1 again"):
            # this should not be possible from the site, but if it was posted:
            # should have no change on the state
            response0 = self.client0.post(
                "/request_friends",
                {"requested_users": [self.chat_user1.pk]},
            )
            self.chat_user.refresh_from_db()
            self.assertFalse(
                self.chat_user1
                in self.chat_user.friends_list.requested_users.all()
            )
            self.assertTrue(
                self.chat_user1
                in self.chat_user.friends_list.friends.all()
            )
            self.assertFalse(
                self.chat_user
                in self.chat_user1.friends_list.requested_users.all()
            )
            self.assertTrue(
                self.chat_user
                in self.chat_user1.friends_list.friends.all()
            )


class TestChat(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="test1", password="test1"
        )
        self.user2 = User.objects.create_user(
            username="test2", password="test2"
        )
        self.chat_user1 = ChatUser.objects.create(user=self.user1)
        self.chat_user2 = ChatUser.objects.create(user=self.user2)
        self.client1 = Client()
        self.client1.post(
            "/login_request",
            {"username": "test1", "password": "test1"},
        )
        self.client2 = Client()
        self.client2.post(
            "/login_request",
            {"username": "test2", "password": "test2"},
        )
        # mutual request
        self.client1.post(
            "/request_friends",
            {"requested_users": [self.chat_user2.pk]},
        )
        self.client2.post(
            "/request_friends",
            {"requested_users": [self.chat_user1.pk]},
        )

    def test_are_friends(self):
        self.assertTrue(
            self.chat_user1
            in self.chat_user2.friends_list.friends.all()
        )
        self.assertTrue(
            self.chat_user2
            in self.chat_user1.friends_list.friends.all()
        )

    def test_chat_with_friend(self):
        with self.subTest("add chat with friend"):
            response = self.client1.post(
                "/add_chat",
                {"users": [self.chat_user2.pk]},
            )
            self.chat_user1.refresh_from_db()
            self.chat_user2.refresh_from_db()
            #check that there is one chat between user 0 and user 1
            self.assertEqual(
                1,
                len(
                    Chat.objects.filter(users=self.chat_user1).filter(
                        users=self.chat_user2
                    )
                ),
            )
        with self.subTest("navigate to chat"):
            response = self.client1.get(
                reverse("chat") + "?chat_number=0"
            )
            html = response.content.decode("utf-8")
            soup = BeautifulSoup(html, "html.parser")
            header_div = soup.find("div", class_="topbar-container")
            self.assertEqual(response.status_code, 200)
            self.assertIn(str(self.chat_user1), header_div.text)
            self.assertIn(str(self.chat_user2), header_div.text)
        
        with self.subTest("send message"):
            response = self.client1.post(
                reverse("send_message"),
                {
                    "chat_number": 0,
                    "text": "test message",
                },
            )
            self.assertEqual(response.status_code, 302)
            # check that message was added to chat
            self.chat_user1.refresh_from_db()
            self.chat_user2.refresh_from_db()
            self.assertEqual(
                "test message",
                self.chat_user1.chats.first().messages.last().text,
            )
            # check that message was added to user 2
            self.assertEqual(
                "test message",
                self.chat_user2.chats.first().messages.last().text,
            )

          
