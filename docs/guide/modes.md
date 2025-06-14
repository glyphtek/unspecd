# Focus Mode vs Normal Mode

Unspec'd supports two distinct display modes that affect how your tools are presented to users. Understanding when and how to use each mode is crucial for creating the best user experience.

## Overview

| Mode | Purpose | UI Layout | Best For |
|------|---------|-----------|----------|
| **Normal Mode** | Multi-tool dashboard | Sidebar + main content | Teams, multiple tools, exploration |
| **Focus Mode** | Single-tool interface | Full-screen tool only | Embedded usage, specific workflows |

## Normal Mode (Default)

Normal Mode is the default experience that provides a complete dashboard interface with navigation between multiple tools.

### Features

- **Sidebar Navigation**: Lists all available tools with search and filtering
- **Tool Switching**: Easy navigation between different tools
- **Dashboard Layout**: Professional multi-tool interface
- **Tool Discovery**: Users can explore all available tools
- **Copy Commands**: Share specific tools with team members

### When to Use Normal Mode

✅ **Perfect for:**
- **Team dashboards** with multiple related tools
- **Admin panels** with various management functions
- **Development environments** where you want to explore tools
- **Multi-user environments** where different people use different tools
- **Tool discovery** and exploration scenarios

### Example: Normal Mode Setup

```typescript
// Library Mode
const app = new UnspecdUI({
  tools: [
    userManagementTool,
    orderDashboardTool,
    inventoryTool,
    reportingTool
  ]
  // focusMode: false (default)
});

await startServer(app);
```

```bash
# CLI Mode
npx @glyphtek/unspecd dev  # Discovers and shows all tools
```

### Normal Mode UI

```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Unspec'd Dashboard                                   │
├─────────────┬───────────────────────────────────────────┤
│ 📋 Tools    │ 👤 User Management                        │
│             │                                           │
│ 👤 Users    │ ┌─────────────────────────────────────┐   │
│ 📦 Orders   │ │ Name     │ Email        │ Role     │   │
│ 📊 Reports  │ │ John Doe │ john@co.com  │ Admin    │   │
│ ⚙️  Settings│ │ Jane S.  │ jane@co.com  │ User     │   │
│             │ └─────────────────────────────────────┘   │
│ 🔍 Search   │                                           │
│             │ [Add User] [Export] [Settings]            │
└─────────────┴───────────────────────────────────────────┘
```

## Focus Mode

Focus Mode presents a single tool in a full-screen interface without navigation elements, perfect for embedded usage or specific workflows.

### Features

- **Full-Screen Interface**: Tool takes up the entire viewport
- **No Sidebar**: Clean, distraction-free interface
- **Single Purpose**: Designed for one specific task
- **Embeddable**: Perfect for integration into existing applications
- **Simplified UI**: Minimal chrome, maximum content

### When to Use Focus Mode

✅ **Perfect for:**
- **Embedded tools** in existing applications
- **Single-purpose interfaces** for specific workflows
- **Kiosk mode** or dedicated terminals
- **Mobile interfaces** where space is limited
- **Focused workflows** where users shouldn't be distracted

### Example: Focus Mode Setup

```typescript
// Library Mode
const app = new UnspecdUI({
  tools: [userManagementTool],
  focusMode: true  // Enable focus mode
});

await startServer(app);
```

```bash
# CLI Mode - Focus on single tool
npx @glyphtek/unspecd exec user-management.tool.ts
```

### Focus Mode UI

```
┌─────────────────────────────────────────────────────────┐
│ 👤 User Management                    🔗 Copy Command   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Name         │ Email            │ Role     │ Actions │ │
│ │ John Doe     │ john@company.com │ Admin    │ [Edit]  │ │
│ │ Jane Smith   │ jane@company.com │ User     │ [Edit]  │ │
│ │ Bob Johnson  │ bob@company.com  │ Manager  │ [Edit]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Add New User] [Export Data] [Import Users]             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Configuration

### Library Mode Configuration

```typescript
// Normal Mode (default)
const app = new UnspecdUI({
  tools: [tool1, tool2, tool3]
  // focusMode defaults to false
});

// Focus Mode
const app = new UnspecdUI({
  tools: [singleTool],
  focusMode: true
});
```

### CLI Mode Configuration

```bash
# Normal Mode - Dashboard with all tools
npx @glyphtek/unspecd dev

# Focus Mode - Single tool
npx @glyphtek/unspecd exec my-tool.ts
```

### Automatic Focus Mode

Focus Mode is automatically enabled in certain scenarios:

1. **Single Tool**: When only one tool is registered
2. **CLI Exec**: When using `unspecd exec` command
3. **Explicit Configuration**: When `focusMode: true` is set

```typescript
// Automatic focus mode (single tool)
const app = new UnspecdUI({
  tools: [onlyTool]  // Only one tool = auto focus mode
});

// Explicit focus mode (multiple tools, but focus on first)
const app = new UnspecdUI({
  tools: [primaryTool, secondaryTool],
  focusMode: true  // Shows only primaryTool
});
```

## Comparison

### User Experience

| Aspect | Normal Mode | Focus Mode |
|--------|-------------|------------|
| **Navigation** | Full sidebar with tool list | No navigation, single tool |
| **Discoverability** | High - users can explore | Low - single purpose |
| **Screen Usage** | Sidebar takes ~20% width | Full screen for content |
| **Context Switching** | Easy between tools | Not applicable |
| **Mobile Experience** | Responsive sidebar | Optimized full-screen |

### Technical Differences

| Feature | Normal Mode | Focus Mode |
|---------|-------------|------------|
| **URL Structure** | `/tool/tool-id` | `/` (root) |
| **Tool Registration** | Multiple tools supported | Single tool displayed |
| **Copy Commands** | Available for each tool | Available for the tool |
| **Search** | Tool search in sidebar | Not applicable |
| **Breadcrumbs** | Tool navigation | Tool title only |

## Use Case Examples

### Normal Mode Examples

**Admin Dashboard:**
```typescript
const adminDashboard = new UnspecdUI({
  tools: [
    userManagementTool,
    systemSettingsTool,
    auditLogTool,
    backupTool,
    monitoringTool
  ]
});
// Users can switch between different admin functions
```

**Development Tools:**
```typescript
const devTools = new UnspecdUI({
  tools: [
    databaseBrowserTool,
    apiTesterTool,
    logViewerTool,
    configEditorTool
  ]
});
// Developers can access various development utilities
```

### Focus Mode Examples

**Embedded User Editor:**
```typescript
const userEditor = new UnspecdUI({
  tools: [userEditTool],
  focusMode: true
});
// Embedded in existing app for user profile editing
```

**Kiosk Interface:**
```typescript
const kioskTool = new UnspecdUI({
  tools: [checkInTool],
  focusMode: true
});
// Single-purpose check-in system
```

**Mobile Workflow:**
```typescript
const mobileInventory = new UnspecdUI({
  tools: [inventoryScanner],
  focusMode: true
});
// Mobile-optimized inventory management
```

## Best Practices

### Choosing the Right Mode

**Use Normal Mode when:**
- You have multiple related tools
- Users need to switch between different functions
- Building a comprehensive admin panel
- Team collaboration is important
- Tool discovery is valuable

**Use Focus Mode when:**
- Embedding in existing applications
- Single-purpose workflows
- Mobile or space-constrained interfaces
- Kiosk or dedicated terminal usage
- Minimizing distractions is important

### Design Considerations

**Normal Mode:**
- Design tools to work well together
- Use consistent naming and organization
- Consider tool grouping and categories
- Provide good tool descriptions

**Focus Mode:**
- Optimize for the specific use case
- Ensure the tool is self-contained
- Consider mobile responsiveness
- Minimize external dependencies

### Performance Considerations

**Normal Mode:**
- Tools are loaded on-demand
- Sidebar navigation is always present
- Multiple tools in memory when switched

**Focus Mode:**
- Single tool loaded immediately
- Minimal UI overhead
- Optimized for single-tool performance

## Migration Between Modes

### From Normal to Focus Mode

```typescript
// Before: Normal mode with multiple tools
const app = new UnspecdUI({
  tools: [tool1, tool2, tool3]
});

// After: Focus on specific tool
const app = new UnspecdUI({
  tools: [tool1],  // Keep only the needed tool
  focusMode: true
});
```

### From Focus to Normal Mode

```typescript
// Before: Focus mode
const app = new UnspecdUI({
  tools: [singleTool],
  focusMode: true
});

// After: Add more tools and disable focus mode
const app = new UnspecdUI({
  tools: [singleTool, additionalTool1, additionalTool2],
  focusMode: false  // or omit (default)
});
```

## Troubleshooting

### Common Issues

**Focus Mode Not Working:**
- Ensure `focusMode: true` is set
- Check that you have tools registered
- Verify no conflicting configuration

**Normal Mode Showing Focus:**
- Check if only one tool is registered (auto-focus)
- Verify `focusMode` is not set to `true`
- Ensure multiple tools are properly configured

**Mobile Layout Issues:**
- Focus Mode is generally better for mobile
- Normal Mode sidebar may need custom CSS
- Consider responsive design patterns

## Related Topics

- 🔧 [Tool Specifications](./tool-specifications.md) - How to define tools
- 📖 [Getting Started](./getting-started.md) - Basic setup
- 🎯 [CLI Usage](./cli.md) - Command-line interface
- 💡 [Examples](../examples/) - Real-world implementations

---

**Choose the right mode for your use case!** Normal Mode for comprehensive dashboards, Focus Mode for embedded and single-purpose tools. 🎯 