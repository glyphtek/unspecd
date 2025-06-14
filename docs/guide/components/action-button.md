# Action Button

The Action Button component provides interactive buttons that trigger functions with optional confirmation dialogs, loading states, and success feedback. Perfect for user actions, form submissions, data operations, and workflow triggers.

## Basic Usage

```typescript
const deleteUserButton = {
  id: 'delete-user-button',
  title: 'Delete User',
  content: {
    type: 'actionButton',
    label: 'Delete User',
    variant: 'danger',
    confirmationMessage: 'Are you sure you want to delete this user? This action cannot be undone.',
    successMessage: 'User deleted successfully'
  },
  functions: {
    onClick: async ({ inputs }) => {
      const userId = inputs?.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      return { success: true, message: 'User deleted successfully' };
    }
  }
};
```

## Configuration

### Basic Properties

```typescript
content: {
  type: 'actionButton',
  label: 'Button Text',           // Required: Button text
  variant: 'primary',             // Optional: Button style
  size: 'medium',                 // Optional: Button size
  disabled: false,                // Optional: Disable button
  loading: false,                 // Optional: Show loading state
  icon: 'trash',                  // Optional: Button icon
  fullWidth: false                // Optional: Full width button
}
```

### Button Variants

```typescript
// Primary button (default)
variant: 'primary'      // Blue, main action

// Secondary button
variant: 'secondary'    // Gray, secondary action

// Success button
variant: 'success'      // Green, positive action

// Warning button
variant: 'warning'      // Yellow, caution action

// Danger button
variant: 'danger'       // Red, destructive action

// Ghost button
variant: 'ghost'        // Transparent, subtle action

// Link button
variant: 'link'         // Text-only, minimal styling
```

### Button Sizes

```typescript
size: 'small'     // Compact button
size: 'medium'    // Default size
size: 'large'     // Prominent button
```

### Confirmation Dialog

```typescript
content: {
  type: 'actionButton',
  label: 'Delete Item',
  confirmationMessage: 'Are you sure you want to delete this item?',
  confirmationTitle: 'Confirm Deletion',     // Optional: Custom title
  confirmLabel: 'Yes, Delete',               // Optional: Custom confirm button
  cancelLabel: 'Cancel'                      // Optional: Custom cancel button
}
```

### Success and Error Feedback

```typescript
content: {
  type: 'actionButton',
  label: 'Save Changes',
  successMessage: 'Changes saved successfully!',
  errorMessage: 'Failed to save changes',    // Optional: Custom error message
  showSuccessFor: 3000                       // Optional: Success message duration (ms)
}
```

## Required Functions

### `onClick({ inputs, data })`
The function called when the button is clicked.

```typescript
functions: {
  onClick: async ({ inputs, data }) => {
    // Perform the action
    const result = await performAction(inputs, data);
    
    // Return success response
    return {
      success: true,
      message: 'Action completed successfully',
      data: result
    };
  }
}
```

**Parameters:**
- `inputs` - Tool inputs configuration
- `data` - Any additional data passed to the function

**Return Value:**
- Success object with optional message and data
- Throw error for failure cases

## Complete Examples

### File Upload Button

```typescript
const fileUploadButton = {
  id: 'file-upload-button',
  title: 'Upload File',
  content: {
    type: 'actionButton',
    label: 'Upload File',
    variant: 'primary',
    icon: 'upload',
    successMessage: 'File uploaded successfully!'
  },
  inputs: {
    file: {
      type: 'file',
      label: 'Select File',
      accept: '.pdf,.doc,.docx',
      required: true
    }
  },
  functions: {
    onClick: async ({ inputs }) => {
      if (!inputs.file) {
        throw new Error('Please select a file to upload');
      }
      
      const formData = new FormData();
      formData.append('file', inputs.file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: `File "${result.filename}" uploaded successfully`,
        data: result
      };
    }
  }
};
```

### Email Notification Button

```typescript
const sendNotificationButton = {
  id: 'send-notification-button',
  title: 'Send Notification',
  content: {
    type: 'actionButton',
    label: 'Send Email Notification',
    variant: 'primary',
    icon: 'mail',
    confirmationMessage: 'Send notification email to all users?',
    successMessage: 'Notification sent successfully!'
  },
  inputs: {
    subject: {
      type: 'text',
      label: 'Email Subject',
      required: true,
      placeholder: 'Enter email subject'
    },
    message: {
      type: 'textarea',
      label: 'Message',
      required: true,
      rows: 4,
      placeholder: 'Enter your message...'
    },
    priority: {
      type: 'select',
      label: 'Priority',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' }
      ],
      defaultValue: 'normal'
    }
  },
  functions: {
    onClick: async ({ inputs }) => {
      // Validation
      if (!inputs.subject?.trim()) {
        throw new Error('Email subject is required');
      }
      
      if (!inputs.message?.trim()) {
        throw new Error('Message content is required');
      }
      
      // Send notification
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: inputs.subject,
          message: inputs.message,
          priority: inputs.priority,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: `Notification sent to ${result.recipientCount} users`,
        data: result
      };
    }
  }
};
```

### Data Export Button

```typescript
const exportDataButton = {
  id: 'export-data-button',
  title: 'Export Data',
  content: {
    type: 'actionButton',
    label: 'Export to CSV',
    variant: 'secondary',
    icon: 'download',
    successMessage: 'Data exported successfully!'
  },
  inputs: {
    dateRange: {
      type: 'dateRange',
      label: 'Date Range',
      required: true
    },
    format: {
      type: 'select',
      label: 'Export Format',
      options: [
        { value: 'csv', label: 'CSV' },
        { value: 'excel', label: 'Excel' },
        { value: 'json', label: 'JSON' }
      ],
      defaultValue: 'csv'
    },
    includeHeaders: {
      type: 'boolean',
      label: 'Include Headers',
      defaultValue: true
    }
  },
  functions: {
    onClick: async ({ inputs }) => {
      // Validate date range
      if (!inputs.dateRange?.start || !inputs.dateRange?.end) {
        throw new Error('Please select a date range');
      }
      
      // Generate export
      const response = await fetch('/api/data/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: inputs.dateRange.start,
          endDate: inputs.dateRange.end,
          format: inputs.format,
          includeHeaders: inputs.includeHeaders
        })
      });
      
      if (!response.ok) {
        throw new Error('Export failed. Please try again.');
      }
      
      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${new Date().toISOString().split('T')[0]}.${inputs.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Data export downloaded successfully'
      };
    }
  }
};
```

### System Maintenance Button

```typescript
const maintenanceModeButton = {
  id: 'maintenance-mode-button',
  title: 'System Maintenance',
  content: {
    type: 'actionButton',
    label: 'Enable Maintenance Mode',
    variant: 'warning',
    icon: 'settings',
    confirmationMessage: 'This will put the system in maintenance mode and prevent user access. Continue?',
    confirmationTitle: 'Enable Maintenance Mode',
    successMessage: 'Maintenance mode enabled'
  },
  inputs: {
    duration: {
      type: 'select',
      label: 'Maintenance Duration',
      options: [
        { value: '30', label: '30 minutes' },
        { value: '60', label: '1 hour' },
        { value: '120', label: '2 hours' },
        { value: 'custom', label: 'Custom' }
      ],
      required: true
    },
    customDuration: {
      type: 'number',
      label: 'Custom Duration (minutes)',
      min: 1,
      visible: (inputs) => inputs.duration === 'custom'
    },
    message: {
      type: 'textarea',
      label: 'Maintenance Message',
      placeholder: 'Message to display to users during maintenance...',
      defaultValue: 'System is currently under maintenance. Please try again later.'
    }
  },
  functions: {
    onClick: async ({ inputs }) => {
      const duration = inputs.duration === 'custom' 
        ? inputs.customDuration 
        : parseInt(inputs.duration);
      
      if (!duration || duration < 1) {
        throw new Error('Please specify a valid maintenance duration');
      }
      
      const response = await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          duration: duration,
          message: inputs.message,
          startTime: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to enable maintenance mode');
      }
      
      return {
        success: true,
        message: `Maintenance mode enabled for ${duration} minutes`
      };
    }
  }
};
```

### Batch Operations Button

```typescript
const batchDeleteButton = {
  id: 'batch-delete-button',
  title: 'Batch Delete',
  content: {
    type: 'actionButton',
    label: 'Delete Selected Items',
    variant: 'danger',
    icon: 'trash',
    confirmationMessage: 'Delete all selected items? This action cannot be undone.',
    successMessage: 'Selected items deleted successfully'
  },
  inputs: {
    selectedIds: {
      type: 'array',
      label: 'Selected Items',
      required: true
    }
  },
  functions: {
    onClick: async ({ inputs }) => {
      if (!inputs.selectedIds || inputs.selectedIds.length === 0) {
        throw new Error('No items selected for deletion');
      }
      
      const response = await fetch('/api/items/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: inputs.selectedIds
        })
      });
      
      if (!response.ok) {
        throw new Error('Batch delete operation failed');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: `Successfully deleted ${result.deletedCount} items`,
        data: result
      };
    }
  }
};
```

## Advanced Features

### Conditional Button State

```typescript
content: {
  type: 'actionButton',
  label: 'Process Order',
  disabled: (inputs) => !inputs.orderId || inputs.status !== 'pending',
  variant: (inputs) => inputs.priority === 'high' ? 'danger' : 'primary'
}
```

### Dynamic Button Text

```typescript
content: {
  type: 'actionButton',
  label: (inputs) => inputs.isEnabled ? 'Disable Feature' : 'Enable Feature',
  variant: (inputs) => inputs.isEnabled ? 'warning' : 'success'
}
```

### Progress Tracking

```typescript
functions: {
  onClick: async ({ inputs, onProgress }) => {
    const items = inputs.items;
    const total = items.length;
    
    for (let i = 0; i < total; i++) {
      await processItem(items[i]);
      onProgress?.({
        current: i + 1,
        total: total,
        message: `Processing item ${i + 1} of ${total}`
      });
    }
    
    return { success: true, message: 'All items processed' };
  }
}
```

### Multiple Actions

```typescript
const multiActionButton = {
  id: 'multi-action-button',
  title: 'Actions',
  content: {
    type: 'actionButton',
    label: 'Actions',
    variant: 'primary',
    actions: [
      {
        label: 'Edit',
        icon: 'edit',
        functionName: 'editItem'
      },
      {
        label: 'Duplicate',
        icon: 'copy',
        functionName: 'duplicateItem'
      },
      {
        label: 'Delete',
        icon: 'trash',
        variant: 'danger',
        confirmationMessage: 'Delete this item?',
        functionName: 'deleteItem'
      }
    ]
  },
  functions: {
    editItem: async ({ inputs }) => {
      // Edit logic
    },
    duplicateItem: async ({ inputs }) => {
      // Duplicate logic
    },
    deleteItem: async ({ inputs }) => {
      // Delete logic
    }
  }
};
```

## Styling and Customization

### CSS Classes

```css
/* Button base styles */
.unspecd-action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

/* Button variants */
.unspecd-action-button.primary {
  background-color: #3b82f6;
  color: white;
}

.unspecd-action-button.secondary {
  background-color: #6b7280;
  color: white;
}

.unspecd-action-button.success {
  background-color: #10b981;
  color: white;
}

.unspecd-action-button.warning {
  background-color: #f59e0b;
  color: white;
}

.unspecd-action-button.danger {
  background-color: #ef4444;
  color: white;
}

/* Button states */
.unspecd-action-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.unspecd-action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unspecd-action-button.loading {
  position: relative;
  color: transparent;
}

.unspecd-action-button.loading::after {
  content: '';
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Success feedback */
.unspecd-success-message {
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Error feedback */
.unspecd-error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
```

### Custom Icons

```typescript
content: {
  type: 'actionButton',
  label: 'Custom Action',
  icon: {
    type: 'svg',
    content: '<svg>...</svg>'
  }
}
```

## Best Practices

### 1. **Clear Action Labels**
```typescript
// ✅ Good - Clear, action-oriented labels
label: 'Delete User'
label: 'Send Invitation'
label: 'Export Data'

// ❌ Bad - Vague labels
label: 'Submit'
label: 'OK'
label: 'Action'
```

### 2. **Appropriate Confirmations**
```typescript
// ✅ Good - Confirm destructive actions
content: {
  type: 'actionButton',
  label: 'Delete Account',
  variant: 'danger',
  confirmationMessage: 'This will permanently delete your account and all data. This cannot be undone.'
}

// ❌ Bad - No confirmation for destructive action
content: {
  type: 'actionButton',
  label: 'Delete Account',
  variant: 'danger'
  // Missing confirmation
}
```

### 3. **Proper Error Handling**
```typescript
// ✅ Good - User-friendly error messages
functions: {
  onClick: async ({ inputs }) => {
    try {
      return await performAction(inputs);
    } catch (error) {
      if (error.code === 'INSUFFICIENT_PERMISSIONS') {
        throw new Error('You do not have permission to perform this action');
      }
      throw new Error('Action failed. Please try again.');
    }
  }
}
```

### 4. **Loading States**
```typescript
// ✅ Good - Show loading for long operations
functions: {
  onClick: async ({ inputs, setLoading }) => {
    setLoading?.(true);
    try {
      const result = await longRunningOperation(inputs);
      return result;
    } finally {
      setLoading?.(false);
    }
  }
}
```

## Common Use Cases

- **Form submissions and data saving**
- **File uploads and downloads**
- **Data export and import operations**
- **User management actions**
- **System administration tasks**
- **Workflow triggers and automation**
- **Batch operations**
- **API integrations**

## Related Components

- **[Edit Form](./edit-form.md)** - For form submission buttons
- **[Editable Table](./editable-table.md)** - For table action buttons
- **[Display Record](./display-record.md)** - For record action buttons

---

**Action Button makes user interactions smooth and intuitive!** Use it for any user action that needs to trigger a function with proper feedback and confirmation. 🔘✨ 