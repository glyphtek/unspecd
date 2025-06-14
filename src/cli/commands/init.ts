/**
 * @fileoverview Init command handler (unspecd init)
 *
 * This command initializes a new Unspec'd project by creating the necessary
 * directory structure, configuration files, and example tools.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Handles the init command for creating a new Unspec'd project.
 * Creates package.json, .gitignore, tools directory, example tool, and unspecd.config.ts.
 */
export async function initCommand(): Promise<void> {
  console.log("🚀 Initializing new Unspec'd project...");

  // Safety check: ensure unspecd.config.ts doesn't already exist
  if (existsSync('unspecd.config.ts')) {
    console.error('❌ An unspecd.config.ts file already exists. Initialization cancelled.');
    process.exit(1);
  }

  try {
    // Create package.json
    console.log('📦 Creating package.json...');
    const packageJson = {
      name: 'my-unspecd-project',
      version: '1.0.0',
      description: "A new Unspec'd project",
      main: 'unspecd.config.ts',
      scripts: {
        dev: 'unspecd dev unspecd.config.ts',
      },
      devDependencies: {
        unspecd: 'latest',
      },
    };
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

    // Create .gitignore
    console.log('📝 Creating .gitignore...');
    const gitignoreContent = `# Dependencies
node_modules/
.npm
.pnpm-store/

# Environment variables
.env*
!.env.example

# Build outputs
dist/
build/
.output/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.nyc_output/

# Temporary folders
tmp/
temp/
`;
    writeFileSync('.gitignore', gitignoreContent);

    // Create tools directory
    console.log('📁 Creating tools/ directory...');
    mkdirSync('tools', { recursive: true });

    // Create example tool file
    console.log('🛠️  Creating tools/welcome.tool.ts...');
    const welcomeToolContent = `import { ToolSpec } from 'unspecd';

/**
 * Welcome Tool - A simple example to get you started with Unspec'd
 * 
 * This tool demonstrates the displayRecord content type, which is perfect
 * for showing structured information like dashboards, profiles, or summaries.
 */
const welcomeTool: ToolSpec = {
  id: 'welcome',
  title: '🎉 Welcome to Unspec\'d',

  content: {
    type: 'displayRecord',
    dataLoader: {
      functionName: 'getWelcomeData'
    },
    displayConfig: {
      fields: [
        { field: 'message', label: 'Welcome Message' },
        { field: 'description', label: 'What is Unspec\'d?' },
        { field: 'nextSteps', label: 'Next Steps' },
        { field: 'documentation', label: 'Learn More' }
      ]
    }
  },

  functions: {
    getWelcomeData: async () => {
      return {
        message: 'Congratulations! Your Unspec\'d project is ready.',
        description: 'Unspec\'d is a framework for building admin tools, dashboards, and internal applications using a declarative specification approach. Define your tools with simple configuration objects, and let the framework handle the UI.',
        nextSteps: 'Try modifying this tool or create new ones in the tools/ directory. Each tool is defined by a ToolSpec object that describes its data sources and UI configuration.',
        documentation: 'Visit the Unspec\'d documentation to learn about different content types like editableTable, actionButton, and editForm.'
      };
    }
  }
};

// Export as default for automatic discovery
export default welcomeTool;
`;
    writeFileSync(join('tools', 'welcome.tool.ts'), welcomeToolContent);

    // Create unspecd.config.ts
    console.log('⚙️  Creating unspecd.config.ts...');
    const configContent = `/**
 * Unspec'd Configuration File
 * 
 * This is the main configuration file for your Unspec'd project.
 * Add your tools to the tools array to make them available in the application.
 */

import welcomeTool from './tools/welcome.tool.js';

// Export your tools as the default export
export default [
  welcomeTool
  // Add more tools here as you create them
  // e.g., userManagementTool, reportingTool, etc.
];
`;
    writeFileSync('unspecd.config.ts', configContent);

    // Success message
    console.log('');
    console.log("✅ Success! Your Unspec'd project has been created.");
    console.log('');
    console.log('Next steps:');
    console.log('');
    console.log("1. Run 'bun install' to install dependencies.");
    console.log("2. Run 'bunx unspecd dev' to start the dashboard with all tools.");
    console.log('3. Open your browser to http://localhost:3000 to see your dashboard.');
    console.log('');
    console.log('🎯 Framework Mode Features:');
    console.log('   - Automatic tool discovery in tools/ directory');
    console.log('   - Multi-tool dashboard with navigation');
    console.log('   - Hot reloading for development');
    console.log('');
    console.log('💡 Tip: Check out tools/welcome.tool.ts to see how tools are defined,');
    console.log('   then create more .tool.ts files in the tools/ directory!');
  } catch (error) {
    console.error('❌ Failed to initialize project:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
