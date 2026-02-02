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
  "dueDate": "2026-01-23T17:00:00Z"
  "externalId": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXX", <- Hex digits
  "id": 0,
  "isCompleted": false,
  "list": "Name of Reminders list for the task",
  "notes": "Any notes",
  "priority": 0,
  "title": "Buy milk"
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