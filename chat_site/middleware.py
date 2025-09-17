# myproject/middleware/token_auth.py
from typing import Callable
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
import logging


@database_sync_to_async
def get_user_from_token(token_key: str):
    try:
        token = Token.objects.select_related("user").get(
            key=token_key
        )
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware:
    """
    ASGI middleware that extracts a token from the Sec-WebSocket-Protocol header
    and attaches the user to the scope as scope['user'].
    """

    def __init__(self, app: Callable):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Only try to authenticate websocket connections
        print("hello")
        if scope.get("type") == "websocket":
            # headers is a list of (name: bytes, value: bytes)
            headers = dict(
                (name.decode().lower(), value.decode())
                for name, value in scope.get("headers", [])
            )

            # The header may look like: "access_token, <the-token>"
            sec_ws_protocol = headers.get(
                "sec-websocket-protocol", ""
            )
            token_key = None

            if sec_ws_protocol:
                # Split on commas, strip whitespace
                parts = [
                    p.strip()
                    for p in sec_ws_protocol.split(",")
                    if p.strip()
                ]
                # Look for the pattern: ["access_token", "<token>"] or "access_token, <token>"
                # Common patterns from browsers: if you pass ["access_token", token] from client,
                # the header may contain both values in order.
                for i, part in enumerate(parts):
                    if part == "access_token" and i + 1 < len(parts):
                        token_key = parts[i + 1]
                        break

                # fallback: if header is a single token string (some proxies or clients)
                # possibly the client sent just the token as the first protocol
                if not token_key and len(parts) == 1:
                    # if you encoded only the token in the protocol, accept it
                    token_key = parts[0]

            if token_key:
                print(f"Token key extracted: {token_key}")
                try:
                    scope["user"] = await get_user_from_token(
                        token_key
                    )
                    print(f"User found: {scope['user']}")
                except Exception as e:
                    print(
                        "Error while authenticating websocket token: %s",
                        e,
                    )
                    scope["user"] = AnonymousUser()
            else:
                print("No token found: anonymous")
                # No token found: anonymous
                scope["user"] = AnonymousUser()

        # Call the inner application
        print("calling inner app...")
        return await self.app(scope, receive, send)
