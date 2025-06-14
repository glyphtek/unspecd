#!/usr/bin/env bun

/**
 * @fileoverview Main CLI entry point for Unspec'd
 *
 * This is the primary entry point for the unspecd command-line tool.
 * It handles command parsing and delegates to specific command handlers.
 */

import { Command } from 'commander';
import { devCommand } from './commands/dev.js';
import { execCommand } from './commands/exec.js';
import { initCommand } from './commands/init.js';

/**
 * Main CLI function that sets up commands and parses arguments
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('unspecd')
    .description('A modern framework for building interactive dashboards and tools with TypeScript')
    .version('1.0.0');

  // Init command
  program
    .command('init')
    .description("Initialize a new Unspec'd project")
    .action(async () => {
      await initCommand();
    });

  // Dev command (Dashboard Mode)
  program
    .command('dev')
    .description('Start Dashboard Mode - discover and display tools')
    .option('--cwd <dir>', 'Set working directory', process.cwd())
    .option('--port <number>', 'Server port', '3000')
    .option('--title <string>', 'Application title')
    .action(async (options) => {
      await devCommand({
        cwd: options.cwd,
        port: Number.parseInt(options.port, 10),
        title: options.title
      });
    });

  // Exec command (Focus Mode)
  program
    .command('exec <file>')
    .description('Start Focus Mode - run a specific tool file')
    .option('--port <number>', 'Server port', '3000')
    .option('--title <string>', 'Application title')
    .action(async (file: string, options) => {
      await execCommand(file, {
        port: Number.parseInt(options.port, 10),
        title: options.title
      });
    });

  // Parse arguments
  await program.parseAsync(process.argv);
}

// Run the CLI
main().catch((error) => {
  console.error('❌ CLI Error:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
