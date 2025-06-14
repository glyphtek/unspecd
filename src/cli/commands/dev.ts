/**
 * @fileoverview Dashboard Mode command handler (unspecd dev)
 *
 * This command discovers tools and starts the development server in Dashboard Mode.
 * It uses the enhanced discovery system to find tools and generates temporary entry points.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { discoverTools } from '../../core/discovery.js';
import { startDevServer } from '../../core/server.js';

/**
 * Options for the dev command
 */
interface DevCommandOptions {
  cwd: string;
  port: number;
  title?: string;
}

/**
 * Generates a temporary entry point file that imports all discovered tools
 * and initializes UnspecdUI with them.
 *
 * @param discoveredTools - Array of discovered tool objects with specs and file paths
 * @param options - Command options including title
 * @returns Path to the generated temporary entry point file
 */
function generateTempEntryPoint(discoveredTools: Array<{ spec: any; filePath: string }>, options: DevCommandOptions): string {
  // Create temporary directory
  const tempDir = '.unspecd';
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = join(tempDir, 'entry.ts');

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
    .map((_tool, index) => {
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
    tools.push(toolSpec${index});
  }`;
    })
    .join('\n');

  // Generate the UnspecdUI configuration with optional title
  const uiConfig = options.title 
    ? `{ tools, title: '${options.title}' }`
    : '{ tools }';

  // Generate the complete entry point content
  const entryPointContent = `${imports}
import { UnspecdUI } from '../src/lib/index.js';

// Initialize tools array
const tools: any[] = [];

${toolExtractions}

// Initialize UnspecdUI with discovered tools
console.log('🚀 Initializing UnspecdUI with', tools.length, 'tools');
console.log('📍 No target element provided, using #root or creating default container');

const ui = new UnspecdUI(${uiConfig});
ui.init();`;

  // Write the temporary entry point file
  writeFileSync(tempFilePath, entryPointContent, 'utf8');

  console.log(`📝 Generated temporary entry point: ${tempFilePath}`);
  return tempFilePath;
}

/**
 * Handles the dev command for Dashboard Mode.
 *
 * This function:
 * 1. Uses the provided working directory for discovery
 * 2. Calls discoverTools with the working directory
 * 3. Generates a temporary entry point file
 * 4. Starts the dev server with the generated entry point
 *
 * @param options - Command options including cwd, port, and title
 */
export async function devCommand(options: DevCommandOptions): Promise<void> {
  const { cwd = process.cwd(), port = 3000, title } = options;
  
  console.log('🏗️  Starting Dashboard Mode - Discovering tools...');
  if (title) {
    console.log(`📝 Application title: ${title}`);
  }
  console.log(`🌐 Server port: ${port}`);

  try {
    console.log('🔍 Discovery Mode: Auto-discovering tools...');

    // Call discovery with the provided working directory
    const discoveredTools = await discoverTools({ cwd });

    if (discoveredTools.length === 0) {
      throw new Error(
        'No tool files found. Make sure you have tools matching your patterns or an unspecd.config.ts file with custom tool patterns.'
      );
    }

    // Generate temporary entry point with title support
    const tempEntryPoint = generateTempEntryPoint(discoveredTools, options);

    // Start the dev server with the configured port
    await startDevServer({
      entryPoint: tempEntryPoint,
      port,
      host: true,
    });
  } catch (error) {
    console.error('❌ Failed to start Dashboard Mode:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
