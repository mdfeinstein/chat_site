# Django Chat Site

This is a simple chat site built with Django and React. It uses Django REST Framework for the API and Channels and Redis for real-time updates. 

## Features

- Friends list management
  - Send, accept, and reject friend requests 
- Create chats with multiple users
- Navigate between chats with sidebar that shows recent chats and messages.
- Real time updates:
  -  messages
  -  friends list,
  -  online status,
  -   "is typing" indicators
- Token-based authentication
- RESTful API

## Technologies

#### *Backend*
**Django REST Framework**: API to interact with SQLite database

**Channels, Redis**: Provides a Pub/Sub to provide real-time updates via WebSockets

#### *Frontend*
**React**: Responsive UI

**React Query**: Fetches data from the API and handles caching

**Mantine**: Provides a set of UI components

**Vite**: Builds the frontend in the browser

