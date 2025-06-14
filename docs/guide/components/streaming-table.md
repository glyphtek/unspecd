# Streaming Table

The Streaming Table component displays real-time data that updates continuously through WebSocket connections. Perfect for live dashboards, monitoring systems, activity feeds, and any scenario requiring real-time data visualization.

## Basic Usage

```typescript
const liveOrdersFeed = {
  id: 'live-orders-feed',
  title: 'Live Orders Feed',
  content: {
    type: 'streamingTable',
    columns: {
      orderId: {
        type: 'text',
        label: 'Order ID'
      },
      customer: {
        type: 'text',
        label: 'Customer'
      },
      amount: {
        type: 'currency',
        label: 'Amount'
      },
      status: {
        type: 'badge',
        label: 'Status',
        colorMap: {
          'pending': 'yellow',
          'processing': 'blue',
          'completed': 'green',
          'cancelled': 'red'
        }
      },
      timestamp: {
        type: 'datetime',
        label: 'Time'
      }
    },
    maxRows: 100,
    autoScroll: true
  },
  functions: {
    streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
      // Simulate real-time order updates
      const interval = setInterval(() => {
        const order = {
          orderId: `ORD-${Math.random().toString(36).substr(2, 9)}`,
          customer: `Customer ${Math.floor(Math.random() * 1000)}`,
          amount: Math.floor(Math.random() * 500) + 50,
          status: ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)],
          timestamp: new Date().toISOString()
        };
        
        onData(order);
      }, 2000);
      
      onConnect();
      
      // Cleanup function
      return () => {
        clearInterval(interval);
        onDisconnect();
      };
    }
  }
};
```

## Configuration

### Content Configuration

```typescript
content: {
  type: 'streamingTable',
  columns: {
    // Column definitions (same as Editable Table)
  },
  maxRows: 100,           // Maximum rows to keep in memory
  autoScroll: true,       // Auto-scroll to show new data
  pauseOnHover: true,     // Pause updates when hovering
  showConnectionStatus: true, // Show connection indicator
  bufferSize: 10,         // Buffer size for batch updates
  updateInterval: 100     // Update UI every 100ms
}
```

### Column Types

Streaming Table supports all the same column types as Editable Table, plus some streaming-specific types:

#### `badge` - Status Badges
```typescript
status: {
  type: 'badge',
  label: 'Status',
  colorMap: {
    'online': 'green',
    'offline': 'red',
    'pending': 'yellow',
    'error': 'red'
  }
}
```

#### `datetime` - Formatted Timestamps
```typescript
timestamp: {
  type: 'datetime',
  label: 'Time',
  format: 'relative'  // 'relative', 'absolute', 'time', 'date'
}
```

#### `progress` - Progress Bars
```typescript
completion: {
  type: 'progress',
  label: 'Progress',
  min: 0,
  max: 100,
  showPercentage: true
}
```

#### `sparkline` - Mini Charts
```typescript
metrics: {
  type: 'sparkline',
  label: 'Trend',
  height: 30,
  color: '#3b82f6'
}
```

## Required Functions

### `streamData({ onData, onError, onConnect, onDisconnect })`
The main streaming function that provides real-time data.

```typescript
functions: {
  streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
    try {
      // Establish connection
      const eventSource = new EventSource('/api/live-data');
      
      eventSource.onopen = () => {
        onConnect();
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onData(data);
        } catch (error) {
          onError(new Error('Failed to parse data'));
        }
      };
      
      eventSource.onerror = (error) => {
        onError(new Error('Connection lost'));
      };
      
      // Return cleanup function
      return () => {
        eventSource.close();
        onDisconnect();
      };
      
    } catch (error) {
      onError(error);
    }
  }
}
```

**Callback Parameters:**
- `onData(rowData)` - Call with new row data
- `onError(error)` - Call when errors occur
- `onConnect()` - Call when connection established
- `onDisconnect()` - Call when connection lost

**Return Value:**
Cleanup function that will be called when the component unmounts.

## Real-World Examples

### GitHub Activity Feed

```typescript
const gitHubActivityFeed = {
  id: 'github-activity-feed',
  title: 'GitHub Activity Feed',
  content: {
    type: 'streamingTable',
    columns: {
      type: {
        type: 'badge',
        label: 'Event',
        colorMap: {
          'PushEvent': 'blue',
          'CreateEvent': 'green',
          'DeleteEvent': 'red',
          'IssuesEvent': 'yellow',
          'PullRequestEvent': 'purple'
        }
      },
      repo: {
        type: 'text',
        label: 'Repository'
      },
      actor: {
        type: 'text',
        label: 'User'
      },
      timestamp: {
        type: 'datetime',
        label: 'Time',
        format: 'relative'
      }
    },
    maxRows: 50,
    autoScroll: true,
    showConnectionStatus: true
  },
  functions: {
    streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
      try {
        const { EventSource } = require('eventsource');
        const eventSource = new EventSource('https://api.github.com/events');
        
        eventSource.onopen = () => {
          onConnect();
        };
        
        eventSource.onmessage = (event) => {
          try {
            const events = JSON.parse(event.data);
            events.forEach(event => {
              onData({
                type: event.type,
                repo: event.repo.name,
                actor: event.actor.login,
                timestamp: event.created_at
              });
            });
          } catch (error) {
            onError(new Error('Failed to parse GitHub events'));
          }
        };
        
        eventSource.onerror = () => {
          onError(new Error('GitHub API connection lost'));
        };
        
        return () => {
          eventSource.close();
          onDisconnect();
        };
        
      } catch (error) {
        onError(error);
      }
    }
  }
};
```

### System Monitoring Dashboard

```typescript
const systemMonitoring = {
  id: 'system-monitoring',
  title: 'System Monitoring',
  content: {
    type: 'streamingTable',
    columns: {
      service: {
        type: 'text',
        label: 'Service'
      },
      status: {
        type: 'badge',
        label: 'Status',
        colorMap: {
          'healthy': 'green',
          'warning': 'yellow',
          'critical': 'red',
          'unknown': 'gray'
        }
      },
      cpu: {
        type: 'progress',
        label: 'CPU %',
        min: 0,
        max: 100,
        showPercentage: true
      },
      memory: {
        type: 'progress',
        label: 'Memory %',
        min: 0,
        max: 100,
        showPercentage: true
      },
      responseTime: {
        type: 'number',
        label: 'Response (ms)',
        suffix: 'ms'
      },
      lastCheck: {
        type: 'datetime',
        label: 'Last Check',
        format: 'relative'
      }
    },
    maxRows: 20,
    autoScroll: false,
    pauseOnHover: true
  },
  functions: {
    streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
      const services = [
        'web-server',
        'database',
        'cache-server',
        'message-queue',
        'file-storage'
      ];
      
      onConnect();
      
      const interval = setInterval(() => {
        services.forEach(service => {
          const cpu = Math.random() * 100;
          const memory = Math.random() * 100;
          const responseTime = Math.random() * 1000;
          
          let status = 'healthy';
          if (cpu > 80 || memory > 90 || responseTime > 500) {
            status = 'warning';
          }
          if (cpu > 95 || memory > 95 || responseTime > 1000) {
            status = 'critical';
          }
          
          onData({
            service,
            status,
            cpu: Math.round(cpu),
            memory: Math.round(memory),
            responseTime: Math.round(responseTime),
            lastCheck: new Date().toISOString()
          });
        });
      }, 5000);
      
      return () => {
        clearInterval(interval);
        onDisconnect();
      };
    }
  }
};
```

### Trading Dashboard

```typescript
const tradingDashboard = {
  id: 'trading-dashboard',
  title: 'Live Trading Data',
  content: {
    type: 'streamingTable',
    columns: {
      symbol: {
        type: 'text',
        label: 'Symbol'
      },
      price: {
        type: 'currency',
        label: 'Price',
        currency: 'USD'
      },
      change: {
        type: 'number',
        label: 'Change',
        prefix: '$',
        colorize: true  // Green for positive, red for negative
      },
      changePercent: {
        type: 'number',
        label: 'Change %',
        suffix: '%',
        decimals: 2,
        colorize: true
      },
      volume: {
        type: 'number',
        label: 'Volume',
        format: 'compact'  // 1.2M instead of 1,200,000
      },
      trend: {
        type: 'sparkline',
        label: 'Trend',
        height: 25
      },
      timestamp: {
        type: 'datetime',
        label: 'Updated',
        format: 'time'
      }
    },
    maxRows: 30,
    autoScroll: false,
    updateInterval: 50  // Fast updates for trading data
  },
  functions: {
    streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META'];
      const priceHistory = {};
      
      // Initialize price history
      symbols.forEach(symbol => {
        priceHistory[symbol] = [];
      });
      
      onConnect();
      
      const interval = setInterval(() => {
        symbols.forEach(symbol => {
          const basePrice = 100 + Math.random() * 200;
          const change = (Math.random() - 0.5) * 10;
          const price = basePrice + change;
          const changePercent = (change / basePrice) * 100;
          const volume = Math.floor(Math.random() * 10000000);
          
          // Update price history for sparkline
          priceHistory[symbol].push(price);
          if (priceHistory[symbol].length > 20) {
            priceHistory[symbol].shift();
          }
          
          onData({
            symbol,
            price,
            change,
            changePercent,
            volume,
            trend: [...priceHistory[symbol]],
            timestamp: new Date().toISOString()
          });
        });
      }, 1000);
      
      return () => {
        clearInterval(interval);
        onDisconnect();
      };
    }
  }
};
```

### Chat/Activity Log

```typescript
const activityLog = {
  id: 'activity-log',
  title: 'Activity Log',
  content: {
    type: 'streamingTable',
    columns: {
      level: {
        type: 'badge',
        label: 'Level',
        colorMap: {
          'info': 'blue',
          'warning': 'yellow',
          'error': 'red',
          'success': 'green'
        }
      },
      message: {
        type: 'text',
        label: 'Message',
        maxWidth: 400
      },
      user: {
        type: 'text',
        label: 'User'
      },
      source: {
        type: 'text',
        label: 'Source'
      },
      timestamp: {
        type: 'datetime',
        label: 'Time',
        format: 'absolute'
      }
    },
    maxRows: 200,
    autoScroll: true,
    pauseOnHover: true,
    showConnectionStatus: true
  },
  functions: {
    streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
      const WebSocket = require('ws');
      const ws = new WebSocket('ws://localhost:8080/activity-stream');
      
      ws.on('open', () => {
        onConnect();
      });
      
      ws.on('message', (data) => {
        try {
          const activity = JSON.parse(data.toString());
          onData(activity);
        } catch (error) {
          onError(new Error('Failed to parse activity data'));
        }
      });
      
      ws.on('error', (error) => {
        onError(new Error(`WebSocket error: ${error.message}`));
      });
      
      ws.on('close', () => {
        onDisconnect();
      });
      
      return () => {
        ws.close();
      };
    }
  }
};
```

## Advanced Features

### Connection Management

```typescript
content: {
  type: 'streamingTable',
  columns: { /* ... */ },
  connectionConfig: {
    autoReconnect: true,
    reconnectDelay: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000
  }
}
```

### Data Filtering

```typescript
content: {
  type: 'streamingTable',
  columns: { /* ... */ },
  filters: {
    level: {
      type: 'select',
      options: [
        { value: 'all', label: 'All Levels' },
        { value: 'error', label: 'Errors Only' },
        { value: 'warning', label: 'Warnings & Errors' }
      ]
    },
    search: {
      type: 'text',
      placeholder: 'Search messages...'
    }
  }
}
```

### Data Aggregation

```typescript
functions: {
  streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
    const aggregator = new DataAggregator();
    
    const interval = setInterval(() => {
      const aggregatedData = aggregator.getAggregatedData();
      aggregatedData.forEach(row => onData(row));
    }, 1000);
    
    return () => clearInterval(interval);
  }
}
```

## Performance Considerations

### Memory Management
- Use `maxRows` to limit memory usage
- Implement data cleanup in streaming functions
- Consider data compression for high-volume streams

### Update Optimization
- Use `bufferSize` to batch updates
- Adjust `updateInterval` based on data frequency
- Implement smart filtering to reduce unnecessary updates

### Connection Efficiency
- Implement proper reconnection logic
- Use heartbeat mechanisms for connection health
- Handle network interruptions gracefully

## Styling and Customization

### CSS Classes
```css
/* Streaming table container */
.unspecd-streaming-table {
  /* Custom styles */
}

/* Connection status indicator */
.unspecd-connection-status {
  position: absolute;
  top: 10px;
  right: 10px;
}

.unspecd-connection-status.connected {
  color: #10b981;
}

.unspecd-connection-status.disconnected {
  color: #ef4444;
}

/* Auto-scroll indicator */
.unspecd-auto-scroll-indicator {
  background-color: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* New row highlight */
.unspecd-table-row.new {
  background-color: #fef3c7;
  animation: highlight 2s ease-out;
}

@keyframes highlight {
  from { background-color: #fbbf24; }
  to { background-color: transparent; }
}
```

## Best Practices

### 1. **Proper Error Handling**
```typescript
// ✅ Good - Comprehensive error handling
streamData: async ({ onData, onError, onConnect, onDisconnect }) => {
  try {
    const connection = await establishConnection();
    onConnect();
    
    connection.onData = onData;
    connection.onError = onError;
    
    return () => {
      connection.close();
      onDisconnect();
    };
  } catch (error) {
    onError(error);
  }
}
```

### 2. **Memory Management**
```typescript
// ✅ Good - Limit data retention
content: {
  type: 'streamingTable',
  maxRows: 100,  // Prevent memory leaks
  columns: { /* ... */ }
}
```

### 3. **User Experience**
```typescript
// ✅ Good - User-friendly configuration
content: {
  type: 'streamingTable',
  autoScroll: true,
  pauseOnHover: true,  // Let users read data
  showConnectionStatus: true,  // Show connection state
  columns: { /* ... */ }
}
```

### 4. **Data Validation**
```typescript
// ✅ Good - Validate incoming data
streamData: async ({ onData, onError }) => {
  source.onMessage = (rawData) => {
    try {
      const data = JSON.parse(rawData);
      if (validateData(data)) {
        onData(data);
      }
    } catch (error) {
      onError(new Error('Invalid data received'));
    }
  };
}
```

## Common Use Cases

- **Live dashboards and monitoring**
- **Real-time analytics and metrics**
- **Activity feeds and logs**
- **Trading and financial data**
- **IoT sensor data streams**
- **Chat and messaging systems**
- **System health monitoring**
- **Live event tracking**

## Related Components

- **[Editable Table](./editable-table.md)** - For static data management
- **[Display Record](./display-record.md)** - For single record display
- **[Action Button](./action-button.md)** - For stream control actions

---

**Streaming Table brings your data to life with real-time updates!** Perfect for any scenario where users need to monitor live, changing data. 📊⚡ 