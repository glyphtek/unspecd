#!/usr/bin/env bun

/**
 * Enhanced Server API Demo
 * 
 * This script demonstrates both modes of the enhanced Unspec'd server API:
 * 1. Discovery Mode: Auto-discovers tools from configuration
 * 2. Direct Mode: Uses a specific entry point file
 */

// When using the published package, you would import like this:
// import { startServer } from '@glyphtek/unspecd/server';

// For this example, we use relative paths since we're in the source:
import { startServer } from '../../src/lib/server.js';

async function demoDiscoveryMode() {
  console.log('🔍 Demo: Discovery Mode');
  console.log('This mode automatically discovers tools from unspecd.config.ts');
  console.log('');
  
  // Example configuration for discovery mode
  const discoveryConfig = {
    discovery: { cwd: './' },
    port: 3000,
    host: true
  };
  
  console.log('Configuration:');
  console.log(JSON.stringify(discoveryConfig, null, 2));
  console.log('');
  console.log('// Usage:');
  console.log('await startServer({');
  console.log('  discovery: { cwd: "./" },');
  console.log('  port: 3000');
  console.log('});');
  console.log('');
}

async function demoDirectMode() {
  console.log('📁 Demo: Direct Mode');
  console.log('This mode uses a specific entry point file you provide');
  console.log('');
  
  // Example configuration for direct mode
  const directConfig = {
    entryPoint: 'examples/index.ts',
    port: 3001,
    host: true
  };
  
  console.log('Configuration:');
  console.log(JSON.stringify(directConfig, null, 2));
  console.log('');
  console.log('// Usage:');
  console.log('await startServer({');
  console.log('  entryPoint: "examples/index.ts",');
  console.log('  port: 3001');
  console.log('});');
  console.log('');
}

async function main() {
  console.log('🚀 Unspec\'d Enhanced Server API Demo');
  console.log('=====================================');
  console.log('');
  
  await demoDiscoveryMode();
  await demoDirectMode();
  
  console.log('✨ Benefits of the Enhanced API:');
  console.log('• Same powerful auto-discovery as the CLI');
  console.log('• Flexible configuration options');
  console.log('• Consistent behavior between CLI and library');
  console.log('• TypeScript support with full type safety');
  console.log('• Easy to integrate into existing projects');
  console.log('');
  
  console.log('📖 Learn more:');
  console.log('• CLI: Use `unspecd dev --help` to see CLI options');
  console.log('• Library: Import from "unspecd/server" in your code');
  console.log('• Both modes support the same discovery logic');
}

main().catch(console.error); 