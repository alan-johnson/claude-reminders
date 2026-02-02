# Installation
```pip install flask caldav requests```

# Architecture

iCloud Reminders (CalDAV)<br>
&emsp;↕<br>
Flask Server (Python)<br>
&emsp;↕<br>
JSON over HTTPS<br> 
<br>  
Pebble Phone JS (pebble-js-app.js)<br>
&emsp;↕<br>
AppMessage<br>
&emsp;↕<br>
Pebble Watch App (C)

# JSON Schema

## Task Object
```
{
  "id": "icloud-uid-123",
  "title": "Buy milk",
  "completed": false,
  "due": "2026-01-23T17:00:00Z"
}
```

# API

```GET /tasks```

Response:

```
{
  "tasks": [ ... ]
}
```

```POST /tasks/complete```

Payload:

```
{
  "id": "icloud-uid-123",
  "completed": true
}
```