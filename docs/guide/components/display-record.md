# Display Record

The Display Record component shows formatted data from a single record. It's perfect for dashboards, status displays, detail views, and any scenario where you need to present structured information in a clean, readable format.

## Basic Usage

```typescript
const profileTool = {
  id: 'user-profile',
  title: 'User Profile',
  content: {
    type: 'displayRecord',
    dataLoader: {
      functionName: 'loadUserProfile'
    },
    displayConfig: {
      fields: [
        { field: 'name', label: 'Full Name' },
        { field: 'email', label: 'Email Address' },
        { field: 'role', label: 'Role' },
        { field: 'lastLogin', label: 'Last Login', formatter: 'datetime' }
      ]
    }
  },
  functions: {
    loadUserProfile: async () => ({
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Administrator',
      lastLogin: new Date('2024-01-15T10:30:00Z')
    })
  }
};
```

## Configuration

### `dataLoader`
Specifies the function that loads the record data.

```typescript
dataLoader: {
  functionName: 'loadData'  // Function name in the functions object
}
```

### `displayConfig`
Defines how fields should be displayed.

```typescript
displayConfig: {
  fields: [
    {
      field: 'fieldName',      // Required: Field name in the data
      label: 'Display Label',  // Required: Human-readable label
      formatter?: 'text'       // Optional: How to format the value
    }
  ]
}
```

## Field Formatters

Display Record supports multiple formatters to present data appropriately:

### `text` (default)
Plain text display - no special formatting.

```typescript
{ field: 'name', label: 'Full Name', formatter: 'text' }
// or simply:
{ field: 'name', label: 'Full Name' }
```

### `datetime`
Formats dates and timestamps in a human-readable format.

```typescript
{ field: 'createdAt', label: 'Created', formatter: 'datetime' }
// Input: "2024-01-15T10:30:00Z"
// Output: "Jan 15, 2024 at 10:30 AM"
```

### `currency`
Formats numbers as currency values.

```typescript
{ field: 'salary', label: 'Annual Salary', formatter: 'currency' }
// Input: 75000
// Output: "$75,000.00"
```

### `badge`
Displays values as colored status badges.

```typescript
{ field: 'status', label: 'Status', formatter: 'badge' }
// Input: "active"
// Output: Green badge with "Active"
```

**Badge Colors:**
- `active`, `enabled`, `success`, `approved` → Green
- `pending`, `warning`, `review` → Yellow  
- `inactive`, `disabled`, `error`, `rejected` → Red
- `draft`, `info` → Blue
- Default → Gray

### `email`
Creates clickable email links.

```typescript
{ field: 'email', label: 'Email', formatter: 'email' }
// Input: "user@example.com"
// Output: Clickable mailto link
```

### `url`
Creates clickable web links.

```typescript
{ field: 'website', label: 'Website', formatter: 'url' }
// Input: "https://example.com"
// Output: Clickable link that opens in new tab
```

### `boolean`
Displays boolean values as Yes/No or checkmarks.

```typescript
{ field: 'verified', label: 'Email Verified', formatter: 'boolean' }
// Input: true
// Output: "Yes" or ✓ checkmark
```

## Data Loading Function

The data loader function should return an object with the fields you want to display:

```typescript
functions: {
  loadUserProfile: async ({ inputs }) => {
    // Access tool inputs if needed
    const userId = inputs?.userId || 'current';
    
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to load user profile');
    }
    
    return response.json();
  }
}
```

**Function Parameters:**
- `inputs` - Tool inputs configuration
- No other parameters for display record

**Return Value:**
Should return an object where keys match the `field` names in your display configuration.

## Complete Examples

### User Dashboard
```typescript
const userDashboard = {
  id: 'user-dashboard',
  title: 'User Dashboard',
  content: {
    type: 'displayRecord',
    dataLoader: { functionName: 'loadDashboardData' },
    displayConfig: {
      fields: [
        { field: 'name', label: 'Welcome' },
        { field: 'email', label: 'Email', formatter: 'email' },
        { field: 'lastLogin', label: 'Last Login', formatter: 'datetime' },
        { field: 'accountStatus', label: 'Account Status', formatter: 'badge' },
        { field: 'totalOrders', label: 'Total Orders' },
        { field: 'totalSpent', label: 'Total Spent', formatter: 'currency' },
        { field: 'memberSince', label: 'Member Since', formatter: 'datetime' }
      ]
    }
  },
  functions: {
    loadDashboardData: async () => ({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      lastLogin: new Date('2024-01-15T14:22:00Z'),
      accountStatus: 'active',
      totalOrders: 47,
      totalSpent: 2847.50,
      memberSince: new Date('2022-03-10T00:00:00Z')
    })
  }
};
```

### System Status Display
```typescript
const systemStatus = {
  id: 'system-status',
  title: 'System Status',
  content: {
    type: 'displayRecord',
    dataLoader: { functionName: 'loadSystemStatus' },
    displayConfig: {
      fields: [
        { field: 'status', label: 'Overall Status', formatter: 'badge' },
        { field: 'uptime', label: 'Uptime' },
        { field: 'lastDeployment', label: 'Last Deployment', formatter: 'datetime' },
        { field: 'activeUsers', label: 'Active Users' },
        { field: 'responseTime', label: 'Avg Response Time' },
        { field: 'errorRate', label: 'Error Rate' },
        { field: 'version', label: 'Version' }
      ]
    }
  },
  functions: {
    loadSystemStatus: async () => {
      const response = await fetch('/api/system/status');
      return response.json();
    }
  }
};
```

### Order Details
```typescript
const orderDetails = {
  id: 'order-details',
  title: 'Order Details',
  inputs: {
    orderId: 'ORD-12345'
  },
  content: {
    type: 'displayRecord',
    dataLoader: { functionName: 'loadOrderDetails' },
    displayConfig: {
      fields: [
        { field: 'orderNumber', label: 'Order Number' },
        { field: 'customerName', label: 'Customer' },
        { field: 'customerEmail', label: 'Email', formatter: 'email' },
        { field: 'orderDate', label: 'Order Date', formatter: 'datetime' },
        { field: 'status', label: 'Status', formatter: 'badge' },
        { field: 'total', label: 'Total Amount', formatter: 'currency' },
        { field: 'shippingAddress', label: 'Shipping Address' },
        { field: 'trackingNumber', label: 'Tracking Number' }
      ]
    }
  },
  functions: {
    loadOrderDetails: async ({ inputs }) => {
      const response = await fetch(`/api/orders/${inputs.orderId}`);
      return response.json();
    }
  }
};
```

## Styling and Layout

### Responsive Design
Display Record automatically adapts to different screen sizes:
- **Desktop**: Two-column layout with labels on the left
- **Mobile**: Single-column layout with labels above values

### Custom Styling
Override default styles with CSS:

```css
/* Custom field styling */
.unspecd-display-record .field-value {
  font-weight: 600;
}

/* Custom badge colors */
.unspecd-badge.custom-status {
  background-color: purple;
  color: white;
}
```

## Error Handling

### Loading Errors
If the data loader function throws an error, Display Record shows an error state:

```typescript
functions: {
  loadData: async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Unable to load data. Please try again.');
    }
    return response.json();
  }
}
```

### Missing Fields
If a field is missing from the returned data, it displays as "—" (em dash).

### Invalid Data
Display Record handles various data types gracefully:
- `null` or `undefined` → "—"
- Empty strings → "—"
- Invalid dates → "Invalid Date"
- Non-numeric values for currency → "—"

## Performance Considerations

### Data Loading
- Data is loaded once when the component mounts
- No automatic refresh (use Streaming Table for real-time data)
- Loading state shown while data is being fetched

### Memory Usage
- Minimal memory footprint
- No data caching (each load is fresh)
- Automatic cleanup when component unmounts

## Best Practices

### 1. **Meaningful Labels**
```typescript
// ✅ Good - Clear, descriptive labels
{ field: 'createdAt', label: 'Account Created' }

// ❌ Bad - Technical field names
{ field: 'createdAt', label: 'createdAt' }
```

### 2. **Appropriate Formatters**
```typescript
// ✅ Good - Use formatters for better UX
{ field: 'lastLogin', label: 'Last Login', formatter: 'datetime' }
{ field: 'status', label: 'Status', formatter: 'badge' }

// ❌ Bad - Raw data display
{ field: 'lastLogin', label: 'Last Login' } // Shows ISO string
```

### 3. **Logical Field Order**
```typescript
// ✅ Good - Most important fields first
fields: [
  { field: 'name', label: 'Name' },
  { field: 'email', label: 'Email' },
  { field: 'status', label: 'Status' },
  { field: 'lastLogin', label: 'Last Login' }
]
```

### 4. **Error Handling**
```typescript
// ✅ Good - User-friendly error messages
functions: {
  loadData: async () => {
    try {
      const response = await fetch('/api/user');
      return response.json();
    } catch (error) {
      throw new Error('Unable to load user profile. Please refresh the page.');
    }
  }
}
```

## Common Use Cases

- **User profiles and account information**
- **Order and transaction details**
- **System status and monitoring dashboards**
- **Product or item detail views**
- **Configuration and settings displays**
- **Report summaries and KPI displays**

## Related Components

- **[Editable Table](./editable-table.md)** - For displaying multiple records with editing
- **[Edit Form](./edit-form.md)** - For editing the displayed record
- **[Streaming Table](./streaming-table.md)** - For real-time data display

---

**Display Record is perfect for presenting structured information clearly and professionally.** Use it whenever you need to show detailed information about a single entity. 📊 