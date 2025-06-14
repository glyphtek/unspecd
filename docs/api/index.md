# API Reference

Complete API reference for Unspec'd framework components, functions, and utilities.

## Core APIs

### [UnspecdUI Class](./unspecd-ui.md)
The main class for creating Unspec'd applications in Library Mode.

```typescript
import { UnspecdUI } from '@glyphtek/unspecd';

const app = new UnspecdUI({
  title: 'My Application',
  tools: [/* ... */]
});
```

### [Tool Specification](./tool-specification.md)
Complete specification for defining tools and their components.

```typescript
interface Tool {
  id: string;
  title: string;
  content: ComponentContent;
  functions?: Record<string, Function>;
  inputs?: Record<string, InputConfig>;
}
```

### [Component Types](./component-types.md)
All available component types and their configuration options.

- `displayRecord` - Display structured data
- `editableTable` - CRUD data tables
- `editForm` - Form editing interfaces
- `streamingTable` - Real-time data streams
- `actionButton` - Interactive buttons

## Component APIs

### [Display Record API](./components/display-record.md)
API reference for the Display Record component.

### [Editable Table API](./components/editable-table.md)
API reference for the Editable Table component.

### [Edit Form API](./components/edit-form.md)
API reference for the Edit Form component.

### [Streaming Table API](./components/streaming-table.md)
API reference for the Streaming Table component.

### [Action Button API](./components/action-button.md)
API reference for the Action Button component.

## Utility APIs

### [Data Handlers](./data-handlers.md)
Utilities for data processing and validation.

### [Type Definitions](./type-definitions.md)
Complete TypeScript type definitions.

### [Error Handling](./error-handling.md)
Error types and handling patterns.

## CLI APIs

### [CLI Commands](./cli-commands.md)
Complete reference for CLI commands and options.

### [Configuration Files](./configuration.md)
Configuration file formats and options.

## Integration APIs

### [Server Integration](./server-integration.md)
APIs for integrating with web servers and frameworks.

### [Database Integration](./database-integration.md)
Patterns for database integration and data persistence.

### [Authentication](./authentication.md)
Authentication and authorization patterns.

## Advanced APIs

### [Custom Components](./custom-components.md)
Creating custom component types.

### [Plugins](./plugins.md)
Plugin system and extension APIs.

### [Theming](./theming.md)
Theming and customization APIs.

---

**Quick Links:**
- [Getting Started Guide](../guide/getting-started.md)
- [Component Guide](../guide/components.md)
- [Examples](../examples/index.md) 