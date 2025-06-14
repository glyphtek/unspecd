/**
 * @fileoverview Public API for Unspec'd server functionality
 *
 * This module provides the public interface for starting and configuring
 * the Unspec'd development server. It acts as a clean wrapper around the
 * core server logic, providing a stable API for library users.
 *
 * The server supports three modes:
 * 1. Library Mode: Pass a pre-configured UnspecdUI instance
 * 2. Discovery Mode: Automatically discovers tools using unspecd.config.ts
 * 3. Direct Mode: Uses a specific entry point file
 *
 * @example
 * ```typescript
 * import { UnspecdUI, startServer } from 'unspecd';
 *
 * // Library Mode: Pass UnspecdUI instance (recommended)
 * const app = new UnspecdUI({ tools: [myTool] });
 * await startServer(app);
 *
 * // Discovery Mode: Auto-discover tools
 * await startServer({
 *   discovery: { cwd: './' },
 *   port: 3000
 * });
 *
 * // Direct Mode: Uses a specific entry point
 * await startServer({
 *   entryPoint: 'src/my-tools.ts',
 *   port: 3000
 * });
 * ```
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { type DiscoveryConfig, startDevServer } from '../core/server.js';
import { UnspecdUI } from './index.js';

// Extend global type for UI mode flag
declare global {
  var __UNSPECD_UI_MODE__: boolean | undefined;
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
}

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
 * Configuration for library mode server startup with UnspecdUI instance
 */
export interface LibraryServerConfig {
  /** The port to run the server on (defaults to 3000) */
  port?: number;
  /** Whether to allow external network access (defaults to true) */
  host?: boolean;
}

/**
 * Combined server configuration that supports discovery and direct entry point modes
 */
export type ServerConfig = DiscoveryServerConfig | DirectServerConfig;

// Re-export discovery config type for convenience
export type { DiscoveryConfig } from '../core/discovery.js';

/**
 * Starts the Unspec'd development server.
 *
 * This function supports multiple ways to start the server:
 *
 * **Library Mode** (Recommended): Pass a pre-configured UnspecdUI instance
 * **Discovery Mode**: Automatically discovers tools using unspecd.config.ts
 * **Direct Mode**: Uses a specific entry point file
 *
 * @param appOrConfig - UnspecdUI instance, or server configuration options
 * @param config - Optional server configuration when passing UnspecdUI instance
 *
 * @returns Promise that resolves when the server has started successfully
 *
 * @throws {Error} If the server fails to start, configuration is invalid, or no tools are found
 *
 * @example
 * ```typescript
 * import { UnspecdUI, startServer } from 'unspecd';
 *
 * // Library Mode: Pass UnspecdUI instance (simplest)
 * const app = new UnspecdUI({ tools: [myTool, otherTool] });
 * await startServer(app);
 *
 * // Library Mode: With custom port
 * const app = new UnspecdUI({ tools: [myTool] });
 * await startServer(app, { port: 8080 });
 *
 * // Discovery Mode: Auto-discover tools from current directory
 * await startServer({
 *   discovery: { cwd: './' }
 * });
 *
 * // Discovery Mode: Auto-discover tools from specific directory
 * await startServer({
 *   discovery: { cwd: './my-project' },
 *   port: 8080,
 *   host: false
 * });
 *
 * // Direct Mode: Use specific entry point
 * await startServer({
 *   entryPoint: 'src/tools.ts',
 *   port: 3000
 * });
 * ```
 */
export async function startServer(
  appOrConfig: UnspecdUI | ServerConfig,
  config?: LibraryServerConfig,
  targetFile?: string
): Promise<void> {

  // If we're in UI mode, just initialize the UI and skip server startup
  if (globalThis.__UNSPECD_UI_MODE__) {
    if (appOrConfig instanceof UnspecdUI) {
      console.log('🎨 UI Mode: Initializing UnspecdUI directly');
      appOrConfig.init();
    }
    return;
  }

  // Check if first parameter is a UnspecdUI instance
  if (appOrConfig instanceof UnspecdUI) {
    console.log("🚀 Starting Unspec'd in Library Mode...");
    console.log(`📦 UnspecdUI instance with ${appOrConfig.toolCount} tools`);

    // Use port from UnspecdUI instance if available, otherwise from config, otherwise default
    const serverPort = config?.port || appOrConfig.port || 3000;
    const serverHost = config?.host !== undefined ? config.host : true;

    // Find the calling script using process.argv and stack trace as fallback
    const callingScript = findCallingScript(targetFile);

    if (callingScript) {
      console.log(`📁 Using calling script as entry point: ${callingScript}`);

      // Store the full UnspecdUI instance globally for function execution
      globalThis.__UNSPECD_APP_INSTANCE__ = appOrConfig;

      // Store the tools data for the API (without functions, just specs)

      const toolsData: any = {
        tools: appOrConfig.tools.map((t) => ({
          id: t.spec.id,
          title: t.spec.title,
          inputs: t.spec.inputs || {},
          content: t.spec.content,
          // Send function names instead of function objects (functions can't be serialized)
          functionNames: Object.keys(t.spec.functions || {}),
          // Use the tool's filePath if available, otherwise fall back to calling script
          filePath: t.filePath || callingScript,
        })),
        toolCount: appOrConfig.toolCount,
        focusMode: appOrConfig.focusMode,
      };
      
      // Only add title if it's defined
      if (appOrConfig.title !== undefined) {
        toolsData.title = appOrConfig.title;
      }
      
      globalThis.__UNSPECD_TOOLS_DATA__ = toolsData;

      // Generate a simple HTML entry point that fetches tools from API
      const tempDir = '.unspecd';
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }

      const entryPointPath = join(tempDir, 'app.ts');
      
      // Calculate the correct relative path to src/lib/index.js from the entry point
      // Find the project root by looking for package.json
      let projectRoot = process.cwd();
      while (projectRoot !== '/' && !existsSync(join(projectRoot, 'package.json'))) {
        projectRoot = resolve(projectRoot, '..');
      }
      
      const entryPointDir = join(process.cwd(), tempDir);
      const srcLibPath = join(projectRoot, 'src', 'lib', 'index.js');
      const relativePath = relative(entryPointDir, srcLibPath).replace(/\\/g, '/');
      
      const entryPointContent = `// Library mode app entry point with function proxies
import { UnspecdUI } from './${relativePath}';

console.log('🎨 Loading tools from API...');

// Fetch tools data from the API endpoint
async function loadApp() {
  try {
    const response = await fetch('/api/tools');
    const toolsData = await response.json();
    
    console.log(\`📦 Loaded \${toolsData.toolCount} tools from API\`);
    console.log(\`🎯 Focus mode: \${toolsData.focusMode ? 'enabled' : 'disabled'}\`);
    
    // Create proxy functions for each tool
    const toolsWithFunctions = toolsData.tools.map(tool => ({
      ...tool,
      functions: tool.functionNames.reduce((acc, funcName) => {
        acc[funcName] = async (params) => {
          console.log(\`🔧 Executing function \${funcName} for tool \${tool.id}\`);
          const response = await fetch('/api/execute-function', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toolId: tool.id,
              functionName: funcName,
              params
            })
          });
          
          if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || 'Function execution failed');
          }
          
          return await response.json();
        };
        return acc;
      }, {})
    }));
    
    // Convert tools to proper ToolConfig format for UnspecdUI
    const toolConfigs = toolsWithFunctions.map(tool => ({
      description: tool.title,
      spec: {
        id: tool.id,
        title: tool.title,
        inputs: tool.inputs,
        content: tool.content,
        functions: tool.functions
      },
      filePath: tool.filePath // This will enable the copy command
    }));
    
    // Make tools data available globally for streaming components
    window.__UNSPECD_TOOLS_DATA__ = toolsData;
    
    // Create UI instance with the properly formatted tool configs and focus mode
    const ui = new UnspecdUI({
      tools: toolConfigs,
      focusMode: toolsData.focusMode${appOrConfig.title ? `,\n      title: ${JSON.stringify(appOrConfig.title)}` : ''}
    });
    
    ui.init();
    console.log('✨ UI initialized successfully');
  } catch (error) {
    console.error('❌ Failed to load tools:', error);
  }
}

loadApp();
`;

      writeFileSync(entryPointPath, entryPointContent, 'utf8');

      // Start server with the simple entry point
      return startDevServer({
        entryPoint: entryPointPath,
        port: serverPort,
        host: serverHost,
      });
    }
    return startFallbackEntryPointFromTools(appOrConfig, config);
  }

  // Use the existing server config logic
  return startDevServer(appOrConfig);
}

/**
 * Attempts to find a script in process.argv
 */
function findScriptInProcessArgs(): string | null {
  // Skip the first argument (the executable) and look for script files
  for (let i = 1; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (!arg) continue;
    
    // Look for files that end with common script extensions
    if ((arg.endsWith('.ts') || arg.endsWith('.js') || arg.endsWith('.mjs')) && existsSync(arg)) {
      console.log(`✅ Found calling script via process.argv: ${arg}`);
      return arg;
    }
    
    // Try resolving it
    const resolved = resolve(arg);
    if ((resolved.endsWith('.ts') || resolved.endsWith('.js') || resolved.endsWith('.mjs')) && existsSync(resolved)) {
      console.log(`✅ Found calling script via process.argv (resolved): ${resolved}`);
      return resolved;
    }
  }
  return null;
}

/**
 * Extracts file path from a stack trace line using a specific pattern
 * @param line - The stack trace line to parse
 * @param pattern - The regex pattern to use
 * @returns The extracted file path or null if not found
 */
function extractFilePathFromLine(line: string, pattern: RegExp): string | null {
  const match = line.match(pattern);
  return match?.[1] || null;
}

/**
 * Validates and normalizes a file path from stack trace
 * @param filePath - The file path to validate
 * @returns The normalized path if it exists, null otherwise
 */
function validateAndNormalizePath(filePath: string): string | null {
  if (filePath.startsWith('file://')) {
    const decodedPath = decodeURIComponent(filePath.replace('file://', ''));
    if (existsSync(decodedPath)) {
      console.log(`✅ Found calling script in stack trace: ${decodedPath}`);
      return decodedPath;
    }
  } else if (existsSync(filePath)) {
    console.log(`✅ Found calling script in stack trace: ${filePath}`);
    return filePath;
  }
  return null;
}

/**
 * Attempts to find a script in the stack trace
 */
function findScriptInStackTrace(): string | null {
  const stack = new Error().stack;
  if (!stack) return null;

  const lines = stack.split('\n');
  const patterns = [
    /at\s+.*\s+\(([^)]+)\)/,
    /at\s+([^\s]+)/,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const filePath = extractFilePathFromLine(line, pattern);
      if (filePath) {
        const validPath = validateAndNormalizePath(filePath);
        if (validPath) {
          return validPath;
        }
      }
    }
  }
  return null;
}

/**
 * Attempts to find the script that called startServer()
 */
function findCallingScript(targetFile?: string): string | null {
  // If a target file is explicitly provided (e.g., from CLI exec), use that
  if (targetFile && existsSync(targetFile)) {
    console.log(`✅ Using provided target file: ${targetFile}`);
    return targetFile;
  }

  // Try to find the script in process.argv first
  const scriptInArgs = findScriptInProcessArgs();
  if (scriptInArgs) return scriptInArgs;

  // If not found in process.argv, try to find it in the stack trace
  return findScriptInStackTrace();
}

/**
 * Generates an entry point from the tools in the UnspecdUI instance
 */
function generateEntryPointFromTools(ui: UnspecdUI): string {
  const tools = ui.tools;
  
  // Calculate the correct relative path to src/lib/index.js from the entry point
  // Find the project root by looking for package.json
  let projectRoot = process.cwd();
  while (projectRoot !== '/' && !existsSync(join(projectRoot, 'package.json'))) {
    projectRoot = resolve(projectRoot, '..');
  }
  
  const entryPointDir = join(process.cwd(), '.unspecd');
  const srcLibPath = join(projectRoot, 'src', 'lib', 'index.js');
  const relativePath = relative(entryPointDir, srcLibPath).replace(/\\/g, '/');

  return `// Auto-generated entry point for Library Mode
import { UnspecdUI } from './${relativePath}';

console.log('🎯 Generated entry point loaded');
console.log('📋 Available tools: ${tools.map((t) => t.id).join(', ')}');

// Create UnspecdUI instance with original tool specs
const ui = new UnspecdUI({
  tools: ${JSON.stringify(
    tools.map((t) => t.spec),
    null,
    2
  )},
  focusMode: ${ui.focusMode}${ui.title ? `,\n  title: ${JSON.stringify(ui.title)}` : ''}
});

// Initialize the UI
ui.init();
`;
}

function startFallbackEntryPointFromTools(appOrConfig: UnspecdUI, config?: LibraryServerConfig) {
  // Fallback: generate entry point from the tools
  console.log('⚠️  Could not detect calling script, generating entry point from tools');

  // Use port from UnspecdUI instance if available, otherwise from config, otherwise default
  const serverPort = config?.port || appOrConfig.port || 3000;
  const serverHost = config?.host !== undefined ? config.host : true;

  const tempDir = '.unspecd';
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const entryPointPath = join(tempDir, 'generated-entry.ts');
  const entryPointContent = generateEntryPointFromTools(appOrConfig);
  writeFileSync(entryPointPath, entryPointContent, 'utf8');

  console.log(`📁 Using generated entry point: ${entryPointPath}`);

  return startDevServer({
    entryPoint: entryPointPath,
    port: serverPort,
    host: serverHost,
  });
}
