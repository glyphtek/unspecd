import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { type Plugin, createServer } from 'vite';
import { type DiscoveryConfig, discoverTools } from './discovery.js';
import { WebSocketServer } from 'ws';

// Extend global type for tools data API
declare global {
  var __UNSPECD_TOOLS_DATA__:
    | {
        tools: Array<{
          id: string;
          title: string;
          inputs: any;
          content: any;
          functionNames: string[];
          filePath?: string;
        }>;
        toolCount: number;
        focusMode: boolean;
        title?: string;
      }
    | undefined;
  var __UNSPECD_APP_INSTANCE__: any | undefined;
  var __UNSPECD_STREAMING_FUNCTIONS__: Record<string, any> | undefined;
}

// Re-export DiscoveryConfig for convenience
export type { DiscoveryConfig } from './discovery.js';

/**
 * Configuration for discovery-based server startup
 */
export interface DiscoveryServerConfig {
  /** Discovery configuration for auto-finding tools */
  discovery: DiscoveryConfig;
  /** The port to run the server on (defaults to 3000) */
  port?: number;
  /** Whether to allow external network access (defaults to true) */
  host?: boolean;
}

/**
 * Configuration for direct entry point server startup
 */
export interface DirectServerConfig {
  /** The entry point file path for the application */
  entryPoint: string;
  /** The port to run the server on (defaults to 3000) */
  port?: number;
  /** Whether to allow external network access (defaults to true) */
  host?: boolean;
}

/**
 * Combined server configuration that supports both discovery and direct entry point modes
 */
export type ServerConfig = DiscoveryServerConfig | DirectServerConfig;

/**
 * Type guard to check if config uses discovery mode
 */
function isDiscoveryConfig(config: ServerConfig): config is DiscoveryServerConfig {
  return 'discovery' in config;
}

/**
 * Creates a custom Vite plugin that serves a virtual index.html file.
 * This plugin handles root path requests and generates HTML with the specified entry point.
 *
 * @param entryPoint - The entry point file path to include in the generated HTML
 * @returns Vite plugin that serves the virtual HTML
 */
function createHtmlPlugin(entryPoint: string): Plugin {
  return {
    name: 'unspecd-html-generator-plugin',

    configureServer(server) {
      // Add middleware to handle API and root path requests
      server.middlewares.use((req, res, next) => {
        // Handle API endpoint for tools data
        if (req.url === '/api/tools') {
          const toolsData = globalThis.__UNSPECD_TOOLS_DATA__;

          if (toolsData) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(toolsData));
            return;
          }
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'No tools data available' }));
          return;
        }

        // Handle API endpoint for function execution
        if (req.url === '/api/execute-function' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });

          req.on('end', () => {
            handleFunctionExecutionRequest(body, res);
          });

          return;
        }

        // Handle API endpoint for getting streaming functions
        if (req.url === '/api/streaming-functions' && req.method === 'GET') {
          handleStreamingFunctionsRequest(res);
          return;
        }

        // Check if the request is for the root path
        if (req.url === '/') {
          // Generate the boilerplate HTML string with Library Mode support
          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unspec'd Dev Environment</title>
  <!-- Try Tailwind CDN first, with fallback error handling -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    // Fallback styles if Tailwind CDN fails
    window.addEventListener('error', function(e) {
      if (e.filename && e.filename.includes('tailwindcss.com')) {
        console.warn('⚠️ Tailwind CDN failed to load, injecting fallback styles');
        const fallbackCSS = \`
          /* Basic fallback styles when Tailwind CDN fails */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-white { background-color: white; }
          .border { border: 1px solid #e5e7eb; }
          .rounded-lg { border-radius: 8px; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
          .p-6 { padding: 1.5rem; }
          .p-4 { padding: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .text-xl { font-size: 1.25rem; }
          .font-bold { font-weight: bold; }
          .text-gray-600 { color: #6b7280; }
          .w-full { width: 100%; }
          .h-full { height: 100%; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .min-h-screen { min-height: 100vh; }
        \`;
        const style = document.createElement('style');
        style.textContent = fallbackCSS;
        document.head.appendChild(style);
      }
    }, true);
  </script>
  <style>
    /* Base styles for better defaults */
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root { width: 100%; min-height: 100vh; }
    
    /* Premium Navigation Active State */
    .unspecd-nav-button.active {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06) !important;
      transform: scale(1.02) !important;
    }
    .unspecd-nav-button.active h3 {
      color: #1e40af !important;
    }
    .unspecd-nav-button.active .bg-gray-100 {
      background: #dbeafe !important;
      color: #1e40af !important;
    }
    .unspecd-nav-button.active .w-8 {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
    }
    .unspecd-nav-button.active svg {
      color: #ffffff !important;
    }
    
    /* Enhanced Component Styles */
    .unspecd-container { 
      max-width: 100%; 
      overflow-x: auto; 
    }
    .unspecd-form-group { 
      margin-bottom: 1.5rem; 
    }
    .unspecd-label { 
      display: block; 
      margin-bottom: 0.5rem; 
      font-weight: 600; 
      color: #374151; 
    }
    .unspecd-input, .unspecd-textarea, .unspecd-select { 
      width: 100%; 
      padding: 0.75rem; 
      border: 1px solid #d1d5db; 
      border-radius: 0.5rem; 
      font-size: 0.875rem;
      transition: all 0.2s;
      background: #ffffff;
    }
    .unspecd-input:focus, .unspecd-textarea:focus, .unspecd-select:focus { 
      outline: none; 
      border-color: #3b82f6; 
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
    }
    .unspecd-button { 
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
      color: white; 
      padding: 0.75rem 1.5rem; 
      border: none; 
      border-radius: 0.5rem; 
      cursor: pointer; 
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }
    .unspecd-button:hover { 
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }
    .unspecd-button:disabled { 
      opacity: 0.6; 
      cursor: not-allowed; 
      transform: none;
      box-shadow: none;
    }
    .unspecd-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 1rem;
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .unspecd-table th, .unspecd-table td { 
      padding: 1rem; 
      text-align: left; 
      border-bottom: 1px solid #e5e7eb; 
    }
    .unspecd-table th { 
      background: #f9fafb; 
      font-weight: 600; 
      color: #374151;
    }
    .unspecd-table tr:hover { 
      background: #f9fafb; 
    }
    .unspecd-loading { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 2rem; 
      color: #6b7280; 
    }
    .unspecd-error { 
      background: #fef2f2; 
      border: 1px solid #fecaca; 
      color: #dc2626; 
      padding: 1rem; 
      border-radius: 0.5rem; 
      margin: 1rem 0; 
    }
    .unspecd-success { 
      background: #f0fdf4; 
      border: 1px solid #bbf7d0; 
      color: #16a34a; 
      padding: 1rem; 
      border-radius: 0.5rem; 
      margin: 1rem 0; 
    }
    .unspecd-card { 
      background: white; 
      border-radius: 0.75rem; 
      padding: 1.5rem; 
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
      margin-bottom: 1.5rem; 
    }
    .unspecd-tooltip {
      position: relative;
      display: inline-block;
    }
    .unspecd-tooltip .tooltip-content {
      visibility: hidden;
      width: 200px;
      background-color: #1f2937;
      color: #ffffff;
      text-align: center;
      border-radius: 6px;
      padding: 8px;
      position: absolute;
      z-index: 1000;
      bottom: 125%;
      left: 50%;
      margin-left: -100px;
      opacity: 0;
      transition: opacity 0.3s;
      font-size: 0.75rem;
    }
    .unspecd-tooltip:hover .tooltip-content {
      visibility: visible;
      opacity: 1;
    }
    @media (max-width: 768px) {
      .flex { flex-direction: column; }
      .w-80 { width: 100%; height: auto; }
      .unspecd-table { font-size: 0.75rem; }
      .unspecd-table th, .unspecd-table td { padding: 0.5rem; }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Set global variable for Library Mode entry point
    window.__UNSPECD_LIBRARY_MODE_ENTRY_POINT__ = '${entryPoint}';
  </script>
  <script type="module" src="/${entryPoint}"></script>
</body>
</html>`;

          // Send the HTML response
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
        } else {
          // Pass the request to other Vite handlers
          next();
        }
      });
    },
  };
}

/**
 * Generates a temporary entry point file that imports all discovered tools
 * and initializes UnspecdUI with them.
 *
 * @param discoveredTools - Array of discovered tool objects with specs and file paths
 * @returns Path to the generated temporary entry point file
 */
function generateTempEntryPoint(discoveredTools: Array<{ spec: any; filePath: string }>): string {
  // Create temporary directory
  const tempDir = '.unspecd';
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = join(tempDir, 'tmp-entry.ts');

  // Generate import statements for each tool
  const imports = discoveredTools
    .map((tool, index) => {
      // Get relative path from temp file to tool file
      const relativePath = relative(dirname(tempFilePath), tool.filePath);
      // Remove .ts extension for import
      const importPath = relativePath.replace(/\.ts$/, '.js');
      return `import * as tool${index} from '${importPath}';`;
    })
    .join('\n');

  // Generate tool extraction logic
  const toolExtractions = discoveredTools
    .map((tool, index) => {
      return `
  // Extract tool spec from tool${index}
  let toolSpec${index} = null;
  
  if (tool${index}.default && typeof tool${index}.default === 'object' && tool${index}.default.id && tool${index}.default.title) {
    toolSpec${index} = tool${index}.default;
  } else {
    // Look for any named export that looks like a ToolSpec
    for (const [exportName, exportValue] of Object.entries(tool${index})) {
      if (exportName !== 'default' && 
          exportValue && 
          typeof exportValue === 'object' && 
          (exportValue as any).id && 
          (exportValue as any).title) {
        toolSpec${index} = exportValue;
        break;
      }
    }
  }
  
  if (toolSpec${index}) {
    views.push({ 
      ...toolSpec${index}, 
      filePath: '${tool.filePath.replace(/\\/g, '\\\\')}'  // Escape backslashes for Windows
    });
  }`;
    })
    .join('\n');

  // Generate the complete entry point content
  const entryPointContent = `${imports}
import { UnspecdUI } from '../src/lib/index.js';

// Initialize views array
const views: any[] = [];

${toolExtractions}

// Log the discovered tools
console.log(\`🔧 UnspecdUI initialized with \${views.length} view(s)\`);
console.log('📋 Registered views:');
views.forEach((view, index) => {
  console.log(\`  \${index + 1}. \${view.title} (\${view.id})\`);
});

// Initialize UnspecdUI with discovered tools
const ui = new UnspecdUI({ views });
ui.init();`;

  // Write the temporary entry point file
  writeFileSync(tempFilePath, entryPointContent, 'utf8');

  console.log(`📝 Generated temporary entry point: ${tempFilePath}`);
  return tempFilePath;
}

function handleStreamingFunctionsRequest(res: any) {
  try {
    const appInstance = globalThis.__UNSPECD_APP_INSTANCE__;

    if (!appInstance) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'No app instance available' }));
      return;
    }

    // Find all streaming functions
    const streamingFunctions: Record<string, any> = {};
    
    appInstance.tools.forEach((tool: any) => {
      if (tool.spec.content?.type === 'streamingTable') {
        const functionName = tool.spec.content.dataSource?.functionName;
        if (functionName && tool.spec.functions[functionName]) {
          streamingFunctions[`${tool.spec.id}.${functionName}`] = tool.spec.functions[functionName];
        }
      }
    });

    // Store streaming functions globally for access by the frontend
    globalThis.__UNSPECD_STREAMING_FUNCTIONS__ = streamingFunctions;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: true, 
      functionCount: Object.keys(streamingFunctions).length 
    }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }));
  }
}

function handleFunctionExecutionRequest(body: string, res: any) {
  try {
    const { toolId, functionName, params } = JSON.parse(body);
    const appInstance = globalThis.__UNSPECD_APP_INSTANCE__;

    if (!appInstance) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'No app instance available' }));
      return;
    }

    // Find the tool and execute the function
    const tool = appInstance.tools.find((t: any) => t.spec.id === toolId);
    if (!tool) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Tool '${toolId}' not found` }));
      return;
    }

    const func = tool.spec.functions[functionName];
    if (!func) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Function '${functionName}' not found in tool '${toolId}'` }));
      return;
    }

    // Check if this is a streaming function (used by streamingTable content type)
    // Streaming functions should only be called by the streaming table component, not via API
    if (tool.spec.content?.type === 'streamingTable' && 
        tool.spec.content?.dataSource?.functionName === functionName) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: `Function '${functionName}' is a streaming function and cannot be called via API. It should only be used by the streamingTable component.` 
      }));
      return;
    }

    // Execute the function
    Promise.resolve(func(params))
      .then((result) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      })
      .catch((error) => {
        console.error('Function execution error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error during function execution',
          })
        );
      });
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error during function execution',
      })
    );
  }
}

/**
 * Starts a Vite development server with the specified configuration.
 *
 * This function supports two modes:
 * 1. Discovery Mode: Automatically discovers tools and generates a temporary entry point
 * 2. Direct Mode: Uses a provided entry point file directly
 *
 * @param config - Configuration object for server startup
 *
 * @returns Promise that resolves when the server has started successfully
 *
 * @example
 * ```typescript
 * // Discovery Mode: Auto-discover tools from unspecd.config.ts
 * await startDevServer({
 *   discovery: { cwd: './' },
 *   port: 3000
 * });
 *
 * // Direct Mode: Use specific entry point
 * await startDevServer({
 *   entryPoint: 'examples/index.ts',
 *   port: 3000
 * });
 * ```
 */
export async function startDevServer(config: ServerConfig): Promise<void> {
  const { port = 3000, host = true } = config;

  let entryPoint: string;

  try {
    if (isDiscoveryConfig(config)) {
      // Discovery Mode: Auto-discover tools and generate temporary entry point
      console.log('🔍 Discovery Mode: Auto-discovering tools...');

      const discoveredTools = await discoverTools(config.discovery);

      if (discoveredTools.length === 0) {
        throw new Error(
          'No tool files found. Make sure you have tools matching your patterns or an unspecd.config.ts file with custom tool patterns.'
        );
      }

      // Generate temporary entry point
      entryPoint = generateTempEntryPoint(discoveredTools);
    } else {
      // Direct Mode: Use provided entry point
      console.log(`📁 Direct Mode: Using entry point ${config.entryPoint}`);
      entryPoint = config.entryPoint;
    }

    // Create Vite server with custom HTML plugin
    const server = await createServer({
      plugins: [createHtmlPlugin(entryPoint)],
      server: {
        port,
        host,
      },
    });

    // Start the server
    await server.listen();

    // Create WebSocket server for streaming functions
    const wsPort = port + 1;
    const wss = new WebSocketServer({ port: wsPort });
    console.log(`🔌 WebSocket server started on port ${wsPort}`);

    wss.on('connection', (ws) => {
      console.log('🔌 WebSocket client connected');

      ws.on('message', async (message) => {
        try {
          const { type, toolId, functionName, params } = JSON.parse(message.toString());

          if (type === 'start-stream') {
            console.log(`🔄 Starting stream for ${toolId}.${functionName}`);
            
            const appInstance = globalThis.__UNSPECD_APP_INSTANCE__;
            if (!appInstance) {
              ws.send(JSON.stringify({ type: 'error', error: 'No app instance available' }));
              return;
            }

            // Find the tool and streaming function
            const tool = appInstance.tools.find((t: any) => t.spec.id === toolId);
            if (!tool) {
              ws.send(JSON.stringify({ type: 'error', error: `Tool '${toolId}' not found` }));
              return;
            }

            const func = tool.spec.functions[functionName];
            if (!func) {
              ws.send(JSON.stringify({ type: 'error', error: `Function '${functionName}' not found` }));
              return;
            }

            // Call the streaming function with WebSocket callbacks
            try {
              const cleanup = await func({
                onData: (event: any) => {
                  ws.send(JSON.stringify({ type: 'data', event }));
                },
                onError: (error: Error) => {
                  ws.send(JSON.stringify({ type: 'error', error: error.message }));
                },
                onConnect: () => {
                  ws.send(JSON.stringify({ type: 'connect' }));
                },
                onDisconnect: () => {
                  ws.send(JSON.stringify({ type: 'disconnect' }));
                },
                ...params
              });

              // Store cleanup function for when connection closes
              (ws as any)._cleanup = cleanup;
            } catch (error) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }));
            }
          }
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
        // Call cleanup function if it exists
        if ((ws as any)._cleanup) {
          (ws as any)._cleanup();
        }
      });
    });

    // Get server URLs
    const info = server.resolvedUrls;

    // Log success message with server information
    console.log("✅ Unspec'd development server started successfully!");

    if (info?.local && info.local.length > 0) {
      console.log(`🌐 Local: ${info.local[0]}`);
    }
    if (info?.network && info.network.length > 0) {
      console.log(`🌍 Network: ${info.network[0]}`);
    }

    console.log(`📁 Entry point: ${entryPoint}`);
    console.log('🔥 Ready for development!');
  } catch (error) {
    console.error('❌ Failed to start development server:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
