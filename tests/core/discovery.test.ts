/**
 * Unit tests for tool discovery functionality
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { discoverTools } from '../../src/core/discovery.js';
import type { ToolSpec } from '../../src/lib/dsl-schema.js';

// Test directory for isolated testing
const TEST_DIR = join(process.cwd(), 'test-temp-discovery');

describe('Tool Discovery System', () => {
  beforeEach(() => {
    // Create clean test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    // Return to original directory and clean up
    process.chdir(process.cwd().replace('/' + TEST_DIR.split('/').pop()!, ''));
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('Basic Tool Discovery', () => {
    test('should discover tools with default patterns', async () => {
      // Create a test tool file
      mkdirSync('tools', { recursive: true });
      await Bun.write('tools/test.tool.ts', `
        export default {
          id: 'test-tool',
          title: 'Test Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: {
            getData: async () => ({})
          }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('test-tool');
      expect(discoveredTools[0].spec.title).toBe('Test Tool');
      expect(discoveredTools[0].filePath).toContain('test.tool.ts');
    });

    test('should discover multiple tools', async () => {
      mkdirSync('tools', { recursive: true });
      
      await Bun.write('tools/tool1.tool.ts', `
        export default {
          id: 'tool-1',
          title: 'Tool 1',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      await Bun.write('tools/tool2.tool.ts', `
        export default {
          id: 'tool-2',
          title: 'Tool 2',
          content: {
            type: 'actionButton',
            buttonConfig: { label: 'Click' },
            action: { functionName: 'doAction' }
          },
          functions: { doAction: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(2);
      expect(discoveredTools.map(t => t.spec.id).sort()).toEqual(['tool-1', 'tool-2']);
    });

    test('should return empty array when no tools found', async () => {
      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      expect(discoveredTools).toEqual([]);
    });

    test('should discover tools in root directory', async () => {
      await Bun.write('root.tool.ts', `
        export default {
          id: 'root-tool',
          title: 'Root Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('root-tool');
    });
  });

  describe('Configuration File Support', () => {
    test('should use custom patterns from unspecd.config.ts', async () => {
      // Create config with custom patterns
      await Bun.write('unspecd.config.ts', `
        export default {
          tools: ['./custom/**/*.ts', './special/*.tool.ts']
        };
      `);

      // Create tool in custom directory
      mkdirSync('custom/subdir', { recursive: true });
      await Bun.write('custom/subdir/custom.ts', `
        export default {
          id: 'custom-tool',
          title: 'Custom Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('custom-tool');
    });

    test('should fall back to default patterns when config has no tools array', async () => {
      // Clean up any previous config files first
      if (existsSync('unspecd.config.ts')) {
        rmSync('unspecd.config.ts', { force: true });
      }

      // Create config with no tools array - should fall back to defaults
      await Bun.write('unspecd.config.ts', `
        export default {
          someOtherConfig: true
          // No tools array - should fall back to defaults
        };
      `);

      // Clear the import cache to ensure we get the new config
      const configPath = join(process.cwd(), 'unspecd.config.ts');
      delete require.cache[configPath];

      // Clean up any previous files first
      if (existsSync('tools')) {
        rmSync('tools', { recursive: true, force: true });
      }

      mkdirSync('tools', { recursive: true });
      await Bun.write('tools/fallback.tool.ts', `
        export default {
          id: 'fallback-tool',
          title: 'Fallback Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('fallback-tool');
    });

    test('should handle missing config file gracefully', async () => {
      mkdirSync('tools', { recursive: true });
      await Bun.write('tools/normal.tool.ts', `
        export default {
          id: 'normal-tool',
          title: 'Normal Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('normal-tool');
    });
  });

  describe('Tool Import and Validation', () => {
    test('should discover named exports', async () => {
      await Bun.write('named.tool.ts', `
        import type { ToolSpec } from '@glyphtek/unspecd';
        
        export const myTool: ToolSpec = {
          id: 'named-export-tool',
          title: 'Named Export Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('named-export-tool');
    });

    test('should ignore invalid tool exports', async () => {
      await Bun.write('invalid.tool.ts', `
        export default {
          // Missing required fields
          someProperty: 'value'
        };
      `);

      mkdirSync('tools', { recursive: true });
      await Bun.write('tools/valid.tool.ts', `
        export default {
          id: 'valid-tool',
          title: 'Valid Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      // Should only find the valid tool
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('valid-tool');
    });

    test('should handle files with syntax errors gracefully', async () => {
      await Bun.write('syntax-error.tool.ts', `
        export default {
          id: 'broken-tool'
          // Missing comma - syntax error
          title: 'Broken Tool'
        };
      `);

      mkdirSync('tools', { recursive: true });
      await Bun.write('tools/working.tool.ts', `
        export default {
          id: 'working-tool',
          title: 'Working Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      // Should only find the working tool
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.id).toBe('working-tool');
    });
  });

  describe('Tool Content Types', () => {
    test('should discover displayRecord tools', async () => {
      await Bun.write('display.tool.ts', `
        export default {
          id: 'display-tool',
          title: 'Display Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: {
              fields: [
                { field: 'name', label: 'Name' },
                { field: 'email', label: 'Email' }
              ]
            }
          },
          functions: {
            getData: async () => ({ name: 'John', email: 'john@example.com' })
          }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.content.type).toBe('displayRecord');
    });

    test('should discover actionButton tools', async () => {
      await Bun.write('action.tool.ts', `
        export default {
          id: 'action-tool',
          title: 'Action Tool',
          content: {
            type: 'actionButton',
            buttonConfig: { label: 'Execute Action' },
            action: { functionName: 'performAction' }
          },
          functions: {
            performAction: async () => ({ success: true })
          }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.content.type).toBe('actionButton');
    });

    test('should discover editableTable tools', async () => {
      await Bun.write('table.tool.ts', `
        export default {
          id: 'table-tool',
          title: 'Table Tool',
          content: {
            type: 'editableTable',
            dataLoader: { functionName: 'loadData' },
            tableConfig: {
              rowIdentifier: 'id',
              columns: ['name', 'email']
            }
          },
          functions: {
            loadData: async () => ({ items: [], totalItems: 0 })
          }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.content.type).toBe('editableTable');
    });

    test('should discover editForm tools', async () => {
      await Bun.write('form.tool.ts', `
        export default {
          id: 'form-tool',
          title: 'Form Tool',
          content: {
            type: 'editForm',
            formConfig: {
              fields: [
                { field: 'name', label: 'Name', editorType: 'text' }
              ]
            },
            onSubmit: { functionName: 'submitForm' }
          },
          functions: {
            submitForm: async () => ({ success: true })
          }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].spec.content.type).toBe('editForm');
    });
  });

  describe('File Path Handling', () => {
    test('should provide correct absolute file paths', async () => {
      mkdirSync('tools', { recursive: true });
      await Bun.write('tools/path-test.tool.ts', `
        export default {
          id: 'path-tool',
          title: 'Path Tool',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].filePath).toContain('path-test.tool.ts');
      expect(discoveredTools[0].filePath).toMatch(/^\/.*\/path-test\.tool\.ts$/);
    });

    test('should handle nested directory structures', async () => {
      mkdirSync('tools/admin/users', { recursive: true });
      await Bun.write('tools/admin/users/management.tool.ts', `
        export default {
          id: 'user-mgmt',
          title: 'User Management',
          content: {
            type: 'displayRecord',
            dataLoader: { functionName: 'getData' },
            displayConfig: { fields: [] }
          },
          functions: { getData: async () => ({}) }
        };
      `);

      const discoveredTools = await discoverTools({ cwd: process.cwd() });
      
      expect(discoveredTools).toHaveLength(1);
      expect(discoveredTools[0].filePath).toContain('tools/admin/users/management.tool.ts');
    });
  });
}); 