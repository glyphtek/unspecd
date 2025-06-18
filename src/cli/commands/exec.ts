/**
 * @fileoverview Focus Mode command handler (unspecd exec)
 *
 * This command starts the development server in Focus Mode for a single tool file.
 * It handles both regular tool files and UnspecdUI instances.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { startDevServer } from '../../core/server.js';
import { startServer } from '../../lib/server.js';

/**
 * Options for the exec command
 */
interface ExecCommandOptions {
  port: number;
  title?: string;
}

function resolveAndCheckFile(toolFilePath: string): string {
  const resolvedPath = resolve(toolFilePath);
  if (!existsSync(resolvedPath)) {
    console.error(`❌ Tool file not found: ${toolFilePath}`);
    console.error('💡 Make sure the file path is correct and the file exists');
    process.exit(1);
  }
  return resolvedPath;
}

function isUnspecdUIInstance(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.constructor?.name === 'UnspecdUI' || ('tools' in obj && Array.isArray(obj.tools)))
  );
}

function findToolSpecs(module: any, resolvedPath: string): any[] {
  const toolSpecs: any[] = [];
  for (const [exportName, exportValue] of Object.entries(module)) {
    if (
      exportValue &&
      typeof exportValue === 'object' &&
      'id' in exportValue &&
      'title' in exportValue &&
      'content' in exportValue
    ) {
      console.log(`🔧 Detected ToolSpec in export '${exportName}', creating UnspecdUI wrapper`);
      toolSpecs.push({
        ...exportValue,
        filePath: resolvedPath, // Set the file path for the copy command
      });
    }
  }
  return toolSpecs;
}

function startFallbackDevServer(resolvedPath: string, options: ExecCommandOptions) {
  return startDevServer({
    entryPoint: resolvedPath,
    port: options.port,
    host: true,
  });
}

/**
 * Handles the exec command for Focus Mode.
 * Starts the development server with a single tool file as the entry point.
 *
 * @param toolFilePath - Path to the tool file to run in Focus Mode
 * @param options - Command options including port and title
 */
export async function execCommand(toolFilePath: string, options: ExecCommandOptions): Promise<void> {
  const { port = 3000, title } = options;

  console.log(`🎯 Starting Focus Mode for: ${toolFilePath}`);
  if (title) {
    console.log(`📝 Application title: ${title}`);
  }
  console.log(`🌐 Server port: ${port}`);

  let resolvedPath: string;
  try {
    resolvedPath = resolveAndCheckFile(toolFilePath);
  } catch (error) {
    console.error('❌ Failed to resolve tool file:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
    return;
  }

  console.log(`📁 Resolved path: ${resolvedPath}`);

  let module: any;
  try {
    // Try to dynamically import the file to check if it exports a UnspecdUI instance
    console.log('🔍 Checking file exports...');
    module = await import(resolvedPath);
  } catch (importError) {
    console.log('⚠️ Could not analyze file exports, treating as regular entry point');
    console.log('Import error:', importError instanceof Error ? importError.message : String(importError));
    await startFallbackDevServer(resolvedPath, options);
    return;
  }

  // Check if there's a default export that looks like a UnspecdUI instance
  if (isUnspecdUIInstance(module.default)) {
    console.log('📦 Detected UnspecdUI instance, using library mode');
    await startServer(module.default as any, { port }, resolvedPath);
    return;
  }

  // Check for named exports that might be UnspecdUI instances
  for (const [exportName, exportValue] of Object.entries(module)) {
    if (isUnspecdUIInstance(exportValue)) {
      console.log(`📦 Detected UnspecdUI instance in export '${exportName}', using library mode`);
      await startServer(exportValue as any, { port }, resolvedPath);
      return;
    }
  }

  // Check for ToolSpec exports and wrap them in UnspecdUI
  const toolSpecs = findToolSpecs(module, resolvedPath);
  if (toolSpecs.length > 0) {
    console.log(`📦 Creating UnspecdUI instance with ${toolSpecs.length} tool(s)`);
    // Dynamically import UnspecdUI
    const { UnspecdUI } = await import('../../lib/index.js');

    // Create UnspecdUI config with optional title
    const uiConfig: any = {
      tools: toolSpecs,
      focusMode: true, // Enable focus mode for exec command
    };
    if (title) {
      uiConfig.title = title;
    }

    const ui = new UnspecdUI(uiConfig);
    await startServer(ui, { port }, resolvedPath);
    return;
  }

  // If no ToolSpec or UnspecdUI instance found, treat as regular entry point
  console.log('📄 No UnspecdUI instance or ToolSpec detected, treating as regular entry point');
  await startFallbackDevServer(resolvedPath, options);
}
