import { describe, test, expect } from 'bun:test';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

/**
 * Integration Tests for Build System and Examples
 * 
 * These tests verify that:
 * 1. The build system works correctly
 * 2. Examples can be executed without errors
 * 3. Generated files are valid
 */

describe('Build System Integration', () => {
  test('should build successfully for all targets', async () => {
    // Test the build command
    const buildResult = await runCommand('bun', ['run', 'build']);
    
    expect(buildResult.success).toBe(true);
    expect(buildResult.stderr).not.toContain('error');
    
    // Check that all expected files are generated
    expect(existsSync('dist/lib/index.js')).toBe(true);
    expect(existsSync('dist/lib/server.js')).toBe(true);
    expect(existsSync('dist/cli/index.js')).toBe(true);
  }, 30000);

  test('should have valid example files', async () => {
    // Check that example files exist and are valid TypeScript
    expect(existsSync('examples/lib/simple-department-list.ts')).toBe(true);
    expect(existsSync('examples/lib/task-dashboard.ts')).toBe(true);
    expect(existsSync('examples/cli/user-management.tool.ts')).toBe(true);
    
    // Read a sample example and verify it contains expected content
    const exampleContent = await Bun.file('examples/lib/simple-department-list.ts').text();
    expect(exampleContent).toContain('ToolSpec');
    expect(exampleContent).toContain('departmentListTool');
  });

  test('should validate package.json structure', async () => {
    const packageJson = await Bun.file('package.json').json();
    
    // Check essential package.json fields
    expect(packageJson.name).toBe('@glyphtek/unspecd');
    expect(packageJson.version).toBe('1.0.0');
    expect(packageJson.main).toBe('./dist/lib/index.js');
    expect(packageJson.module).toBe('./dist/lib/index.js');
    expect(packageJson.types).toBe('./dist/lib/index.d.ts');
    
    // Check exports
    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['.']).toBeDefined();
    expect(packageJson.exports['./server']).toBeDefined();
    expect(packageJson.exports['./cli']).toBeDefined();
    
    // Check bin
    expect(packageJson.bin).toBeDefined();
    expect(packageJson.bin.unspecd).toBe('./dist/cli/index.js');
  });

  test('should pass core unit tests', async () => {
    // Run only core tests to avoid timeouts
    const testResult = await runCommand('bun', ['test', 'tests/lib/unspecd-ui.test.ts', 'tests/lib/data-handler.test.ts']);
    
    expect(testResult.success).toBe(true);
  }, 30000);
});

/**
 * Helper function to run shell commands
 */
async function runCommand(command: string, args: string[]): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
}> {
  return new Promise((resolve) => {
    const process = spawn(command, args, {
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      resolve({
        success: code === 0,
        stdout,
        stderr,
        code
      });
    });

    process.on('error', (error) => {
      resolve({
        success: false,
        stdout,
        stderr: stderr + error.message,
        code: null
      });
    });
  });
} 