/**
 * Unspec'd Configuration for CLI Examples
 * 
 * This configuration file demonstrates how to customize tool discovery patterns
 * for the CLI mode. The CLI will automatically find and load this configuration
 * when running `unspecd dev --cwd examples/cli`
 */

// When using the published package, you would import like this:
// import type { UnspecdConfig } from '@glyphtek/unspecd/cli';

// For this example, we use relative paths since we're in the source:
import type { UnspecdConfig } from '../../src/core/discovery.js';

const config: UnspecdConfig = {
  /**
   * Custom tool discovery patterns
   * 
   * The CLI will search for files matching these patterns and attempt to
   * import them as tools. Each file should export a ToolSpec as default.
   */
  tools: [
    // Standard .tool.ts pattern
    './*.tool.ts',
    
    // Alternative patterns you could use:
    // './tools/**/*.ts',
    // './**/*.tool.js',
    // './admin-tools/*.ts'
  ]
};

export default config; 