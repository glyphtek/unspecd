import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { glob } from 'glob';
import type { ToolSpec } from '../lib/dsl-schema.js';

/**
 * Configuration for tool discovery
 */
export interface DiscoveryConfig {
  /** The current working directory to search from */
  cwd: string;
}

/**
 * Result of tool discovery containing the spec and its file path
 */
export interface DiscoveredTool {
  /** The imported ToolSpec */
  spec: ToolSpec;
  /** The original file path where the tool was found */
  filePath: string;
}

/**
 * Configuration that can be loaded from unspecd.config.ts
 */
export interface UnspecdConfig {
  /** Array of glob patterns for discovering tool files */
  tools?: string[];
}

/**
 * Attempts to load configuration from unspecd.config.ts file
 *
 * @param cwd - The directory to search for the config file
 * @returns Configuration object if found, null otherwise
 */
async function loadUnspecdConfig(cwd: string): Promise<UnspecdConfig | null> {
  const configPath = join(cwd, 'unspecd.config.ts');

  try {
    // Check if config file exists
    if (!existsSync(configPath)) {
      return null;
    }

    console.log(`📋 Loading configuration from ${configPath}...`);

    // Resolve absolute path for import
    const absoluteConfigPath = resolve(configPath);

    // Dynamic import the config file
    const configModule = await import(/* @vite-ignore */ absoluteConfigPath);

    // Check if the config has tool patterns
    if (configModule.default && typeof configModule.default === 'object') {
      const config = configModule.default as UnspecdConfig;

      if (config.tools && Array.isArray(config.tools)) {
        console.log(`✅ Found ${config.tools.length} tool pattern(s) in config`);
        return config;
      }
    }

    console.log('⚠️  Config file found but no tool patterns defined (expected: tools array)');
    return null;
  } catch (error) {
    console.warn(
      `⚠️  Failed to load config from ${configPath}:`,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

/**
 * Resolves the glob patterns to use for tool discovery
 *
 * @param config - Configuration object from unspecd.config.ts (if found)
 * @returns Array of glob patterns to search
 */
function resolveToolPatterns(config: UnspecdConfig | null): string[] {
  if (config?.tools && Array.isArray(config.tools)) {
    return config.tools;
  }

  // Default patterns if no config found
  return ['./tools/**/*.tool.ts', './*.tool.ts'];
}

/**
 * Validates if an object is a valid ToolSpec
 */
function isValidToolSpec(obj: unknown): obj is ToolSpec {
  return obj !== null && typeof obj === 'object' && 'id' in obj && 'title' in obj;
}

/**
 * Attempts to find a valid ToolSpec in a module's exports
 */
function findToolSpecInModule(module: Record<string, unknown>): ToolSpec | null {
  // First try default export
  if (module.default && isValidToolSpec(module.default)) {
    return module.default;
  }

  // If no valid default export, look for any named export that looks like a ToolSpec
  for (const [exportName, exportValue] of Object.entries(module)) {
    if (exportName !== 'default' && isValidToolSpec(exportValue)) {
      return exportValue;
    }
  }

  return null;
}

async function importToolSpecFromFile(filePath: string): Promise<DiscoveredTool | null> {
  try {
    console.log(`   Importing: ${filePath}`);

    // Use dynamic import to load the module
    const module = await import(/* @vite-ignore */ filePath);

    // Try to find a ToolSpec in the module's exports
    const spec = findToolSpecInModule(module);

    // Validate that we found a ToolSpec
    if (!spec) {
      console.warn(`⚠️  File ${filePath} does not export a valid ToolSpec`);
      return null;
    }

    console.log(`   ✅ Loaded: ${spec.title} (${spec.id})`);

    return {
      spec,
      filePath,
    };
  } catch (error) {
    console.error(
      `   ❌ Error importing tool from ${filePath}:`,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

/**
 * Discovers all ToolSpec files in a directory using glob patterns
 *
 * This function will:
 * 1. Try to load configuration from unspecd.config.ts in the provided cwd
 * 2. Use the tools patterns from config if available, otherwise use defaults
 * 3. Search for matching files and import them
 * 4. Return an array of discovered tools with their specs and file paths
 *
 * @param config - Configuration object with cwd directory
 * @returns Array of discovered tools with their specs and file paths
 */
export async function discoverTools(config: DiscoveryConfig): Promise<DiscoveredTool[]> {
  const { cwd } = config;

  console.log(`🔍 Starting tool discovery in: ${cwd}`);

  // Step 1: Try to load configuration from unspecd.config.ts
  const unspecdConfig = await loadUnspecdConfig(cwd);

  // Step 2: Resolve glob patterns to use
  const patterns = resolveToolPatterns(unspecdConfig);

  console.log(`📂 Using patterns: ${patterns.join(', ')}`);

  // Step 3: Find all files matching the patterns
  const allFilePaths: string[] = [];

  for (const pattern of patterns) {
    try {
      const filePaths = await glob(pattern, {
        cwd,
        absolute: true,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.unspecd/**'],
      });

      allFilePaths.push(...filePaths);
      console.log(`   Found ${filePaths.length} files matching "${pattern}"`);
    } catch (error) {
      console.warn(
        `⚠️  Failed to search pattern "${pattern}":`,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Remove duplicates
  const uniqueFilePaths = [...new Set(allFilePaths)];

  console.log(`📦 Total unique tool files found: ${uniqueFilePaths.length}`);

  if (uniqueFilePaths.length === 0) {
    console.log('ℹ️  No tool files found. Make sure you have:');
    console.log('   - Tool files matching your patterns, OR');
    console.log('   - An unspecd.config.ts file with custom tool patterns');
    return [];
  }

  // Step 4: Dynamically import all found files
  const importPromises = uniqueFilePaths.map(importToolSpecFromFile);

  // Wait for all imports to complete and filter out null results
  const results = await Promise.all(importPromises);
  const discoveredTools = results.filter((result): result is DiscoveredTool => result !== null);

  console.log(`🎉 Successfully discovered ${discoveredTools.length} tools`);

  return discoveredTools;
}
