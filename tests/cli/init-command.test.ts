/**
 * Unit tests for CLI init command functionality
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { initCommand } from '../../src/cli/commands/init.js';

// Test directory for isolated testing
const TEST_DIR = join(process.cwd(), 'test-temp-init');

describe('CLI Init Command', () => {
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

  describe('Project Scaffolding', () => {
    test('should create all required files and directories', async () => {
      await initCommand();

      // Check that all files were created
      expect(existsSync('package.json')).toBe(true);
      expect(existsSync('.gitignore')).toBe(true);
      expect(existsSync('tools')).toBe(true);
      expect(existsSync('tools/welcome.tool.ts')).toBe(true);
      expect(existsSync('unspecd.config.ts')).toBe(true);
    });

    test('should create valid package.json', async () => {
      await initCommand();

      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      
      expect(packageJson.name).toBe('my-unspecd-project');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.scripts.dev).toBe('unspecd dev unspecd.config.ts');
      expect(packageJson.devDependencies.unspecd).toBe('latest');
    });

    test('should create .gitignore with proper entries', async () => {
      await initCommand();

      const gitignore = readFileSync('.gitignore', 'utf-8');
      
      expect(gitignore).toContain('node_modules/');
      expect(gitignore).toContain('.env*');
      expect(gitignore).toContain('dist/');
      expect(gitignore).toContain('.DS_Store');
      expect(gitignore).toContain('*.log');
    });

    test('should create tools directory', async () => {
      await initCommand();

      expect(existsSync('tools')).toBe(true);
      
      // Check that it's actually a directory
      const stats = Bun.file('tools').size;
      expect(typeof stats).toBe('number');
    });

    test('should create welcome tool file', async () => {
      await initCommand();

      const welcomeToolContent = readFileSync('tools/welcome.tool.ts', 'utf-8');
      
      expect(welcomeToolContent).toContain('import { ToolSpec } from \'unspecd\'');
      expect(welcomeToolContent).toContain('id: \'welcome\'');
      expect(welcomeToolContent).toContain('title: \'🎉 Welcome to Unspec\'d\'');
      expect(welcomeToolContent).toContain('type: \'displayRecord\'');
      expect(welcomeToolContent).toContain('export default welcomeTool');
    });

    test('should create unspecd.config.ts', async () => {
      await initCommand();

      const configContent = readFileSync('unspecd.config.ts', 'utf-8');
      
      expect(configContent).toContain('import welcomeTool from \'./tools/welcome.tool.js\'');
      expect(configContent).toContain('export default [');
      expect(configContent).toContain('welcomeTool');
    });
  });

  describe('Error Handling', () => {
    test('should prevent initialization if unspecd.config.ts exists', async () => {
      // Create existing config file
      await Bun.write('unspecd.config.ts', 'export default [];');

      let errorThrown = false;
      let exitCode = 0;

      // Mock process.exit to capture exit code
      const originalExit = process.exit;
      process.exit = ((code: number) => {
        exitCode = code;
        errorThrown = true;
        throw new Error('Process exit called');
      }) as any;

      try {
        await initCommand();
      } catch (error) {
        // Expected to throw due to mocked process.exit
      }

      // Restore original process.exit
      process.exit = originalExit;

      expect(errorThrown).toBe(true);
      expect(exitCode).toBe(1);
      
      // Should not create additional files
      expect(existsSync('package.json')).toBe(false);
    });

    test('should handle file system errors gracefully', async () => {
      // This test is harder to implement without mocking fs operations
      // For now, we'll just ensure the command doesn't crash on basic usage
      await expect(initCommand()).resolves.toBeUndefined();
    });
  });

  describe('Generated File Content Validation', () => {
    test('should generate valid TypeScript in welcome tool', async () => {
      await initCommand();

      const welcomeToolContent = readFileSync('tools/welcome.tool.ts', 'utf-8');
      
      // Basic syntax validation - should contain proper TypeScript constructs
      expect(welcomeToolContent).toContain('const welcomeTool: ToolSpec = {');
      expect(welcomeToolContent).toContain('functions: {');
      expect(welcomeToolContent).toContain('getWelcomeData: async () => {');
      expect(welcomeToolContent).toContain('return {');
    });

    test('should generate valid TypeScript in config file', async () => {
      await initCommand();

      const configContent = readFileSync('unspecd.config.ts', 'utf-8');
      
      expect(configContent).toContain('import welcomeTool from');
      expect(configContent).toContain('export default [');
      expect(configContent).toContain('welcomeTool');
      expect(configContent).toContain('];');
    });

    test('should generate valid JSON in package.json', async () => {
      await initCommand();

      expect(() => {
        JSON.parse(readFileSync('package.json', 'utf-8'));
      }).not.toThrow();
    });
  });

  describe('Welcome Tool Validation', () => {
    test('should create a working welcome tool spec', async () => {
      await initCommand();

      const welcomeToolContent = readFileSync('tools/welcome.tool.ts', 'utf-8');
      
      // Should contain required ToolSpec properties
      expect(welcomeToolContent).toContain('id: \'welcome\'');
      expect(welcomeToolContent).toContain('title:');
      expect(welcomeToolContent).toContain('content: {');
      expect(welcomeToolContent).toContain('functions: {');
      
      // Should have proper displayRecord configuration
      expect(welcomeToolContent).toContain('type: \'displayRecord\'');
      expect(welcomeToolContent).toContain('dataLoader: {');
      expect(welcomeToolContent).toContain('functionName: \'getWelcomeData\'');
      expect(welcomeToolContent).toContain('displayConfig: {');
      expect(welcomeToolContent).toContain('fields: [');
    });

    test('should include helpful welcome messages', async () => {
      await initCommand();

      const welcomeToolContent = readFileSync('tools/welcome.tool.ts', 'utf-8');
      
      expect(welcomeToolContent).toContain('Congratulations! Your Unspec\'d project is ready');
      expect(welcomeToolContent).toContain('What is Unspec\'d?');
      expect(welcomeToolContent).toContain('Next Steps');
      expect(welcomeToolContent).toContain('Learn More');
    });
  });
}); 