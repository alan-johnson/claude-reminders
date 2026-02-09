// PebbleKit JS - Handles communication between watch and REST API
console.log('*** JavaScript file loaded! ***');

// Configuration - can be overridden via localStorage
var DEFAULT_HOSTNAME = "localhost";
var DEFAULT_PORT = 3000;
var DEFAULT_PROVIDER = "provider=apple"

// Try to load from localStorage, fallback to defaults
var hostname = localStorage.getItem('api_hostname') || DEFAULT_HOSTNAME;
var port = parseInt(localStorage.getItem('api_port')) || DEFAULT_PORT;
var API_BASE = "http://" + hostname + ":" + port + "/api";

console.log('Using API:', API_BASE);

// Function to update API base URL
function updateAPIBase() {
  hostname = localStorage.getItem('api_hostname') || DEFAULT_HOSTNAME;
  port = parseInt(localStorage.getItem('api_port')) || DEFAULT_PORT;
  API_BASE = "http://" + hostname + ":" + port + "/api";
  console.log('Updated API:', API_BASE);
}

// Listen for when the app is ready
Pebble.addEventListener('ready', function(e) {
  console.warn('=== PEBBLE READY ===');
  console.log('PebbleKit JS ready!');
  // Don't fetch here, let the watch app request when needed
  
  // Send ready signal to watch (KEY_TYPE = 0)
  Pebble.sendAppMessage({'KEY_TYPE': 0}, 
    function(e) {
      console.log('Ready message sent to watch successfully!');
    },
    function(e) {
      console.log('Failed to send ready message to watch');
    }
  );
});

// Listen for messages from the watch
Pebble.addEventListener('appmessage', function(e) {
  console.warn('=== APPMESSAGE EVENT FIRED ===');
  console.log('AppMessage received!');
  var payload = e.payload;
  console.log('Payload = ' + JSON.stringify(payload));

  // Acknowledge receipt of the message
  //e.ack();

  //if (payload[KEY_TYPE] !== undefined) {
    console.log('Processing payload with KEY_TYPE:', payload.KEY_TYPE);
    if (payload.KEY_TYPE === 1) {
      // Fetch task lists
      console.log('KEY_TYPE 1: Fetching task lists');
      fetchTaskLists();
    } else if (payload.KEY_TYPE === 2) {
      // Fetch tasks for a specific list
      var listId = payload.KEY_ID;
      console.log('KEY_TYPE 2: Fetching tasks for list id:', listId);
      fetchTasks(listId);
    } else if (payload.KEY_TYPE === 3) {
      // Complete a task
      var taskId = payload.KEY_ID;
      var listName = payload.KEY_LIST_NAME;
      console.log('KEY_TYPE 3: Completing task', taskId, 'in list', listName);
      completeTask(taskId, listName);
    }
  }
//}
);

// Fetch task list names
function fetchTaskLists() {
  console.log('Fetching task lists from API...');

  var xhr = new XMLHttpRequest();
  xhr.open('GET', API_BASE + '/lists?' + DEFAULT_PROVIDER, true);
  xhr.onload = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          console.log('Received lists:', JSON.stringify(response));
          sendTaskListsToWatch(response.lists);
        } catch (e) {
          console.log('Error parsing response:', e);
        }
      } else {
        console.log('Failed to fetch task lists. Status:', xhr.status);
      }
    }
  };
  xhr.send();
}

// Send task lists to the watch sequentially with delays to avoid APP_MSG_BUSY
function sendTaskListsToWatch(lists) {
  var currentIndex = 0;

  function sendNextList() {
    if (currentIndex >= lists.length) {
      console.log('All task lists sent successfully');
      return;
    }

    var dict = {
      'KEY_TYPE': 1,
      'KEY_ID': lists[currentIndex].id || currentIndex,
      'KEY_NAME': lists[currentIndex].name || lists[currentIndex]
    };

    Pebble.sendAppMessage(dict,
      function(e) {
        console.log('Task list ' + (currentIndex + 1) + '/' + lists.length + ' sent successfully');
        currentIndex++;
        // Wait 100ms before sending next message to avoid APP_MSG_BUSY
        setTimeout(sendNextList, 100);
      },
      function(e) {
        console.log('Error sending task list ' + (currentIndex + 1) + ', retrying...');
        // Retry after 200ms on error
        setTimeout(sendNextList, 200);
      }
    );
  }

  // Start sending lists
  sendNextList();
}

// Fetch tasks for a specific list
function fetchTasks(listId) {
  console.log('Fetching tasks for list from API: ' + listId);

  var xhr = new XMLHttpRequest();
  var url = API_BASE + '/lists/' + encodeURIComponent(listId) + '/tasks?' + DEFAULT_PROVIDER;
  console.log('Request URL:', url);
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          console.log('Received tasks:', JSON.stringify(response));
          sendTasksToWatch(response.tasks);
        } catch (e) {
          console.log('Error parsing response:', e);
        }
      } else {
        console.log('Failed to fetch tasks. Status:', xhr.status);
      }
    }
  };
  xhr.send();
}

// Send tasks to the watch sequentially with delays to avoid APP_MSG_BUSY
function sendTasksToWatch(tasks) {
  // If no tasks, send a message to clear loading state
  if (!tasks || tasks.length === 0) {
    console.log('No tasks to send, sending empty message to clear loading state');
    var dict = {
      'KEY_TYPE': 2,
      'KEY_ID': '',
      'KEY_NAME': '',
      'KEY_DUE_DATE': 'No due date',
      'KEY_COMPLETED': 0,
      'KEY_NOTES': ''
    };

    Pebble.sendAppMessage(dict,
      function(e) {
        console.log('Empty task list message sent to Pebble successfully!');
      },
      function(e) {
        console.log('Error sending empty task list message to Pebble!');
      }
    );
    return;
  }

  // Send tasks one at a time with delay to avoid APP_MSG_BUSY
  var currentIndex = 0;

  function sendNextTask() {
    if (currentIndex >= tasks.length) {
      console.log('All tasks sent successfully');
      return;
    }

    var task = tasks[currentIndex];
    var dict = {
      'KEY_TYPE': 2,
      'KEY_ID': task.id || '',
      'KEY_NAME': task.name || '',
      'KEY_DUE_DATE': task.dueDate || 'No due date',
      'KEY_COMPLETED': task.completed ? 1 : 0,
      'KEY_NOTES': task.notes || ''
    };

    Pebble.sendAppMessage(dict,
      function(e) {
        console.log('Task ' + (currentIndex + 1) + '/' + tasks.length + ' sent successfully');
        currentIndex++;
        // Wait 100ms before sending next message to avoid APP_MSG_BUSY
        setTimeout(sendNextTask, 100);
      },
      function(e) {
        console.log('Error sending task ' + (currentIndex + 1) + ', retrying...');
        // Retry after 200ms on error
        setTimeout(sendNextTask, 200);
      }
    );
  }

  // Start sending tasks
  sendNextTask();
}

// Complete a task
function completeTask(taskId, listName) {
  console.log('Completing task: ' + taskId + ' in list: ' + listName);
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', API_BASE + '/complete', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 204) {
        console.log('Task completed successfully');
        // Optionally send confirmation back to watch
        var dict = {
          'KEY_TYPE': 4,
          'KEY_ID': taskId
        };
        Pebble.sendAppMessage(dict);
      } else {
        console.log('Failed to complete task. Status: ' + xhr.status);
      }
    }
  };
  
  var data = JSON.stringify({
    taskId: taskId,
    listName: listName
  });

  xhr.send(data);
}

// Configuration page handlers
Pebble.addEventListener('showConfiguration', function(e) {
  console.log('Opening configuration page...');

  // Get current settings
  var currentHostname = localStorage.getItem('api_hostname') || DEFAULT_HOSTNAME;
  var currentPort = localStorage.getItem('api_port') || DEFAULT_PORT;

  // Build configuration URL
  var configUrl = 'https://alan-johnson.github.io/claude-reminders/config.html' +
    '?hostname=' + encodeURIComponent(currentHostname) +
    '&port=' + encodeURIComponent(currentPort);

  console.log('Config URL:', configUrl);
  Pebble.openURL(configUrl);
});

Pebble.addEventListener('webviewclosed', function(e) {
  console.log('Configuration page closed');

  if (e && e.response) {
    console.log('Response:', e.response);

    try {
      var config = JSON.parse(decodeURIComponent(e.response));
      console.log('Parsed config:', JSON.stringify(config));

      // Save settings to localStorage
      if (config.hostname) {
        localStorage.setItem('api_hostname', config.hostname);
        console.log('Saved hostname:', config.hostname);
      }

      if (config.port) {
        localStorage.setItem('api_port', config.port.toString());
        console.log('Saved port:', config.port);
      }

      // Update API base URL
      updateAPIBase();
      console.log('Configuration saved successfully');

    } catch (err) {
      console.log('Error parsing configuration:', err);
    }
  } else {
    console.log('Configuration cancelled or no response');
  }
});
