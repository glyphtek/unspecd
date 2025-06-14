// examples/lib/index.ts

/**
 * Simple example of Unspec'd Library Mode
 * 
 * This demonstrates the cleanest way to start a development server:
 * 1. Create a UnspecdUI instance with your tools
 * 2. Pass it to startServer()
 * 
 * Run with: bun run ./examples/lib/index.ts
 */

// When using the published package, you would import like this:
// import { UnspecdUI, startServer } from '@glyphtek/unspecd';

// For this example, we use relative paths since we're in the source:
import { UnspecdUI } from '../../src/lib/index.js';
import { startServer } from '../../src/lib/server.js';

// Import the tools you want to display
import { userRoleEditorTool } from './user-role-editor.js';
import { liveSignupsCounterTool } from './live-signups-counter.js';
import { promoCodeGeneratorTool } from './promo-code-generator.js';
import { liveOrdersDashboardTool } from './live-orders-dashboard.js';
import { githubFirehoseViewerTool } from './github-firehose-viewer.js';
import { departmentListTool } from './simple-department-list.js';
import { taskDashboardTool } from './task-dashboard.js';
import { spec as columnShorthandTest } from './column-shorthand-test.js';

// Create the UnspecdUI instance with all your tools
const app = new UnspecdUI({
  tools: [
    { ...userRoleEditorTool, filePath: './examples/lib/user-role-editor.ts' },
    { ...liveSignupsCounterTool, filePath: './examples/lib/live-signups-counter.ts' },
    { ...promoCodeGeneratorTool, filePath: './examples/lib/promo-code-generator.ts' },
    { ...liveOrdersDashboardTool, filePath: './examples/lib/live-orders-dashboard.ts' },
    { ...githubFirehoseViewerTool, filePath: './examples/lib/github-firehose-viewer.ts' },
    { ...departmentListTool, filePath: './examples/lib/simple-department-list.ts' },
    { ...taskDashboardTool, filePath: './examples/lib/task-dashboard.ts' },
    { ...columnShorthandTest, filePath: './examples/lib/column-shorthand-test.ts' },
  ]
});

// Start the development server - that's it!
await startServer(app);