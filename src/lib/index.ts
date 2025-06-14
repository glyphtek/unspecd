/**
 * Main entry point for the Unspec'd Framework
 *
 * This file exports the UnspecdUI class, which serves as the primary interface
 * for developers to initialize and manage their declarative UI tools.
 *
 * The UnspecdUI class handles tool registration, normalization, and provides
 * a high-level API for rendering tools within applications.
 */

import type { ToolSpec } from './dsl-schema.js';
import { renderTool } from './runtime.js';

/**
 * Configuration object for tool registration in UnspecdUI.
 * Tools can be provided either as raw ToolSpec objects or with custom descriptions.
 */
export interface ToolConfig {
  /** The display description for navigation (overrides spec.title) */
  description: string;
  /** The tool specification defining the behavior and content */
  spec: ToolSpec;
  /** Optional file path for copy command functionality */
  filePath?: string;
}

/**
 * Configuration object for the UnspecdUI constructor.
 */
export interface UnspecdUIConfig {
  /** Array of tool specifications or tool configurations to register */
  tools: Array<ToolSpec | ToolConfig>;
  /** Enable focus mode to hide sidebar and show single tool directly */
  focusMode?: boolean;
  /** Application title displayed in the UI */
  title?: string;
  /** Default server port (can be overridden in startServer) */
  port?: number;
}

/**
 * Normalized internal representation of a registered tool.
 * All tools are converted to this consistent format internally.
 */
interface NormalizedTool {
  /** Unique identifier for the tool (from ToolSpec.id) */
  id: string;
  /** Display title for navigation and UI */
  title: string;
  /** The complete tool specification */
  spec: ToolSpec;
  /** Optional file path for copy command functionality */
  filePath?: string;
}

/**
 * Main class for the Unspec'd Framework providing high-level developer experience.
 *
 * The UnspecdUI class serves as the primary entry point for developers who want to
 * create declarative UI applications. It handles tool registration, normalization,
 * and provides methods for rendering and managing tools.
 *
 * @example
 * ```typescript
 * import { UnspecdUI } from '@unspecd/core';
 * import { myToolSpec } from './my-tool';
 *
 * const ui = new UnspecdUI({
 *   tools: [
 *     myToolSpec,
 *     {
 *       description: 'Custom Tool Name',
 *       spec: anotherToolSpec
 *     }
 *   ]
 * });
 *
 * ui.init(document.getElementById('app'));
 * ```
 */
export class UnspecdUI {
  /**
   * Private storage for normalized tool configurations.
   * All registered tools are converted to a consistent internal format
   * regardless of how they were originally provided.
   */
  #tools: NormalizedTool[] = [];

  /**
   * Private flag indicating whether this instance is in focus mode.
   * Focus mode hides the sidebar and displays only the single tool.
   */
  #focusMode = false;

  /**
   * Application title displayed in the UI.
   */
  #title: string | undefined;

  /**
   * Default server port.
   */
  #port: number | undefined;

  /**
   * Creates a new UnspecdUI instance with the provided tool specifications.
   *
   * The constructor processes the incoming tools array and normalizes all entries
   * into a consistent internal format. This allows developers to provide tools
   * either as raw ToolSpec objects or with custom navigation descriptions.
   *
   * @param config - Configuration object containing the tools to register
   * @param config.tools - Array of ToolSpec objects or ToolConfig objects
   *
   * @example
   * ```typescript
   * // Using raw ToolSpec objects
   * const ui = new UnspecdUI({
   *   tools: [toolSpec1, toolSpec2]
   * });
   *
   * // Using custom descriptions
   * const ui = new UnspecdUI({
   *   tools: [
   *     { description: 'User Management', spec: userToolSpec },
   *     { description: 'System Settings', spec: settingsToolSpec }
   *   ]
   * });
   *
   * // Mixed approach
   * const ui = new UnspecdUI({
   *   tools: [
   *     rawToolSpec,
   *     { description: 'Custom Name', spec: anotherToolSpec }
   *   ]
   * });
   * ```
   */
  constructor(config: UnspecdUIConfig) {
    // Validate configuration
    if (!config) {
      throw new Error('UnspecdUI configuration is required');
    }

    if (!config.tools) {
      throw new Error('UnspecdUI tools array is required');
    }

    if (!Array.isArray(config.tools)) {
      throw new Error('UnspecdUI tools must be an array');
    }

    this.#tools = this.#normalizeTools(config.tools);
    this.#focusMode = config.focusMode || false;
    this.#title = config.title;
    this.#port = config.port;

    const titleInfo = this.#title ? ` "${this.#title}"` : '';
    console.log(`🔧 UnspecdUI initialized${titleInfo} with ${this.#tools.length} tools${this.#focusMode ? ' (Focus Mode)' : ''}`);

    // Log registered tools for development visibility
    if (this.#tools.length > 0) {
      console.log('📋 Registered tools:');
      this.#tools.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.title} (${tool.id})`);
      });
    }
  }

  /**
   * Validates a ToolConfig object structure
   * @param toolConfig - The ToolConfig to validate
   * @param index - Index for error reporting
   */
  #validateToolConfig(toolConfig: ToolConfig, index: number): void {
    if (!toolConfig.spec || typeof toolConfig.spec !== 'object') {
      throw new Error(`Tool at index ${index} has invalid spec property`);
    }

    if (!toolConfig.spec.id || !toolConfig.spec.title) {
      throw new Error(`Tool at index ${index} spec missing required id or title`);
    }
  }

  /**
   * Validates a ToolSpec object structure
   * @param toolSpec - The ToolSpec to validate
   * @param index - Index for error reporting
   */
  #validateToolSpec(toolSpec: ToolSpec, index: number): void {
    if (!toolSpec.id || !toolSpec.title) {
      throw new Error(`Tool at index ${index} missing required id or title`);
    }

    if (!toolSpec.content || typeof toolSpec.content !== 'object') {
      throw new Error(`Tool at index ${index} missing required content`);
    }

    if (!toolSpec.functions || typeof toolSpec.functions !== 'object') {
      throw new Error(`Tool at index ${index} missing required functions object`);
    }
  }

  /**
   * Normalizes a single tool from ToolSpec or ToolConfig to NormalizedTool
   * @param tool - The tool to normalize
   * @param index - Index for error reporting
   * @returns Normalized tool object
   */
  #normalizeSingleTool(tool: ToolSpec | ToolConfig, index: number): NormalizedTool {
    // Validate that the tool is an object
    if (!tool || typeof tool !== 'object') {
      throw new Error(`Tool at index ${index} must be an object`);
    }

    // Check if the tool is a ToolConfig object (has description property)
    if ('description' in tool && 'spec' in tool) {
      const toolConfig = tool as ToolConfig;
      this.#validateToolConfig(toolConfig, index);

      const normalized: NormalizedTool = {
        id: toolConfig.spec.id,
        title: toolConfig.description,
        spec: toolConfig.spec,
      };
      if (toolConfig.filePath) {
        normalized.filePath = toolConfig.filePath;
      }
      return normalized;
    }

    // Treat as raw ToolSpec
    const toolSpec = tool as ToolSpec;
    this.#validateToolSpec(toolSpec, index);

    return {
      id: toolSpec.id,
      title: toolSpec.title,
      spec: toolSpec,
    };
  }

  /**
   * Normalizes an array of mixed ToolSpec and ToolConfig objects into a consistent format.
   * This method ensures all tools have the required properties and converts them to
   * a standardized NormalizedTool format for internal use.
   *
   * @param tools - Array of mixed ToolSpec and ToolConfig objects
   * @returns Array of normalized tool objects
   */
  #normalizeTools(tools: Array<ToolSpec | ToolConfig>): NormalizedTool[] {
    return tools.map((tool, index) => {
      try {
        return this.#normalizeSingleTool(tool, index);
      } catch (error) {
        console.error(`❌ Failed to normalize tool at index ${index}:`, error);
        throw new Error(
          `Invalid tool configuration at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  /**
   * Initializes the UnspecdUI instance and renders it to the target element.
   *
   * This method handles the complete initialization process, including container
   * setup, layout rendering, and basic structure creation. If no target element
   * is provided, it looks for #root in the document or creates a default container.
   *
   * @param targetElement - Optional DOM element to render the UI into.
   *                       If not provided, uses #root or creates a default container.
   *
   * @example
   * ```typescript
   * const ui = new UnspecdUI({ tools: [myToolSpec] });
   *
   * // Initialize with specific target element
   * ui.init(document.getElementById('app'));
   *
   * // Initialize with automatic container detection (#root or create new)
   * ui.init();
   * ```
   */
  init(targetElement?: HTMLElement): void {
    console.log(`🚀 Initializing UnspecdUI with ${this.#tools.length} tools`);

    // Step 1: Determine the final container element
    const container = this.#resolveTargetElement(targetElement);

    console.log('📍 Using container element:', container.tagName, container.id ? `#${container.id}` : '');

    // Step 2: Clear any existing content and set up base structure
    container.innerHTML = '';
    container.className = 'unspecd-container bg-gray-50 min-h-screen';

    // Step 3: Handle empty state
    if (this.#tools.length === 0) {
      this.#renderEmptyState(container);
      return;
    }

    // Step 4: Render the main application structure
    this.#renderApplication(container);

    console.log('✨ UnspecdUI initialization complete');
  }

  /**
   * Resolves the target element for rendering.
   * Priority: provided element > #root > create new element
   *
   * @param targetElement - Optional target element
   * @returns The resolved target element
   */
  #resolveTargetElement(targetElement?: HTMLElement): HTMLElement {
    // Priority 1: Use provided element
    if (targetElement) {
      return targetElement;
    }

    // Priority 2: Look for #root element
    const rootElement = document.getElementById('root');
    if (rootElement) {
      return rootElement;
    }

    // Priority 3: Create and append a new element to body
    const newContainer = document.createElement('div');
    newContainer.id = 'unspecd-auto-container';
    document.body.appendChild(newContainer);

    console.log('📍 Created new container element since no #root found');
    return newContainer;
  }

  /**
   * Renders the empty state when no tools are registered.
   *
   * @param container - The container element to render into
   */
  #renderEmptyState(container: HTMLElement): void {
    const emptyStateHtml = `
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-center max-w-md mx-auto p-8">
          <div class="mb-6">
            <div class="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">No Tools Found</h2>
          <p class="text-gray-600 mb-6">
            It looks like you haven't registered any tools yet. Add some tools to your UnspecdUI configuration to get started.
          </p>
          <div class="bg-gray-100 rounded-lg p-4 text-left">
            <code class="text-sm text-gray-800">
              const ui = new UnspecdUI({<br>
              &nbsp;&nbsp;tools: [myToolSpec]<br>
              });
            </code>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = emptyStateHtml;
  }

  /**
   * Renders the main application with navigation and tool content.
   *
   * @param container - The container element to render into
   */
  #renderApplication(container: HTMLElement): void {
    // Create the main application structure
    if (this.#focusMode && this.#tools.length === 1) {
      // Focus mode: single tool, no sidebar
      const appHtml = `
        <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <!-- Enhanced Focus Mode Header -->
          <header class="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-10" id="unspecd-header">
            <div class="max-w-7xl mx-auto px-6 py-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-6">
                  <div class="flex items-center space-x-3">
                    <!-- Focus Mode Icon -->
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </div>
                    <div>
                      <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent" id="unspecd-current-title">
                        ${this.#tools[0]?.title || 'Focus Mode'}
                      </h1>
                      <div class="flex items-center space-x-3 mt-1">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          <span id="unspecd-current-id">${this.#tools[0]?.id || ''}</span>
                        </span>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                          <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          Focus Mode
                        </span>
                      </div>
                    </div>
                  </div>
                  <div id="unspecd-copy-button-container" class="flex items-center">
                    <!-- Copy button will be inserted here -->
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="hidden sm:flex items-center px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Live Updates
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <!-- Enhanced Main Content Area -->
          <main class="max-w-7xl mx-auto px-6 py-8" id="unspecd-content">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/60 overflow-hidden">
              <div class="p-8">
                ${this.#tools.length > 0 ? this.#renderInitialTool() : '<div class="text-gray-500 text-center py-12">No tool available</div>'}
              </div>
            </div>
          </main>
          
          <!-- Subtle Footer -->
          <footer class="max-w-7xl mx-auto px-6 py-4 text-center">
            <p class="text-xs text-gray-400">Powered by Unspec'd Framework</p>
          </footer>
        </div>
      `;
      container.innerHTML = appHtml;
    } else {
      // Normal mode: sidebar + content
      const appHtml = `
        <div class="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <!-- Enhanced Sidebar Navigation -->
          <div class="w-80 bg-white/80 backdrop-blur-lg shadow-xl border-r border-gray-200/60">
            <div class="p-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">Unspec'd Dashboard</h1>
                  <p class="text-sm text-gray-600">${this.#tools.length} tool${this.#tools.length === 1 ? '' : 's'} available</p>
                </div>
              </div>
            </div>
            <nav class="p-4 overflow-y-auto h-[calc(100vh-140px)]" id="unspecd-nav">
              ${this.#renderNavigation()}
            </nav>
          </div>
          
          <!-- Enhanced Main Content Area -->
          <div class="flex-1 flex flex-col">
            <header class="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 px-6 py-6 sticky top-0 z-10" id="unspecd-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-6">
                  <div class="flex items-center space-x-3">
                    <div>
                      <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent" id="unspecd-current-title">
                        ${this.#tools[0]?.title || 'Select a Tool'}
                      </h2>
                      <div class="flex items-center space-x-3 mt-1">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          <span id="unspecd-current-id">${this.#tools[0]?.id || ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div id="unspecd-copy-button-container" class="flex items-center">
                    <!-- Copy button will be inserted here -->
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="hidden sm:flex items-center px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Live Updates
                  </div>
                </div>
              </div>
            </header>
            <main class="flex-1 overflow-auto p-6" id="unspecd-content">
              <div class="max-w-6xl mx-auto">
                <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/60 overflow-hidden">
                  <div class="p-8">
                    ${this.#tools.length > 0 ? this.#renderInitialTool() : '<div class="text-gray-500 text-center py-12">Select a tool from the sidebar</div>'}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      `;
      container.innerHTML = appHtml;

      // Set up navigation event listeners (only in normal mode)
      this.#setupNavigation();
    }

    // Render the first tool by default
    if (this.#tools.length > 0) {
      this.#setActiveTool(this.#tools[0]!.id);
    }
  }

  /**
   * Renders the navigation menu for all registered tools.
   *
   * @returns HTML string for the navigation menu
   */
  #renderNavigation() {
    return this.#tools
      .map(
        (tool, _index) => `
      <div class="group">
        <button 
          onclick="unspecdApp.loadTool('${tool.id}')" 
          class="unspecd-nav-button w-full text-left transition-all duration-200 ease-in-out rounded-xl p-4 mb-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:border-blue-200 border border-transparent group-hover:scale-[1.02]"
          data-tool-id="${tool.id}"
        >
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
              <svg class="w-4 h-4 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200 text-sm">${tool.title}</h3>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </button>
      </div>
    `
      )
      .join('');
  }

  /**
   * Renders the initial tool content.
   *
   * @returns HTML string for the initial tool
   */
  #renderInitialTool() {
    if (this.#tools.length === 0) {
      return '<div class="text-gray-500 text-center py-12">No tools available</div>';
    }

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center space-y-4">
            <div class="flex space-x-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <p class="text-gray-600 font-medium">Initializing tool components...</p>
            <p class="text-sm text-gray-500">Loading ${this.#tools[0]?.title || 'tool'}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders the content for a specific tool.
   *
   * @param tool - The normalized tool object to render
   * @returns HTML string for the tool content
   */
  #renderToolContent(tool: NormalizedTool): string {
    try {
      // Create a placeholder that will be populated by the runtime
      const toolId = `unspecd-tool-${tool.id}`;

      // Schedule the actual rendering after DOM update
      setTimeout(async () => {
        const targetElement = document.getElementById(toolId);
        if (targetElement) {
          try {
            await renderTool(tool.spec, targetElement);
          } catch (error) {
            console.error(`❌ Error rendering tool ${tool.id}:`, error);
            targetElement.innerHTML = `
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Error Rendering Tool</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>Failed to render "${tool.title}" (${tool.id})</p>
                    </div>
                    <div class="mt-4">
                      <details class="text-sm">
                        <summary class="cursor-pointer text-red-700 hover:text-red-800 font-medium">Show Error Details</summary>
                        <pre class="mt-2 text-red-600 whitespace-pre-wrap text-xs bg-red-100 p-3 rounded">${error instanceof Error ? error.message : 'Unknown error'}</pre>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
        }
      }, 0);

      // Return placeholder HTML that will be populated
      return `
        <div class="bg-transparent">
          <div id="${toolId}" class="tool-content">
            <div class="flex items-center justify-center py-16">
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-xl">
                  <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Loading ${tool.title}</h3>
                <p class="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">Initializing tool components and setting up the interface...</p>
                <div class="mt-6 flex justify-center">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error(`❌ Error setting up tool ${tool.id}:`, error);
      return `
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error Setting Up Tool</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>Failed to set up "${tool.title}" (${tool.id})</p>
              </div>
              <div class="mt-4">
                <details class="text-sm">
                  <summary class="cursor-pointer text-red-700 hover:text-red-800 font-medium">Show Error Details</summary>
                  <pre class="mt-2 text-red-600 whitespace-pre-wrap text-xs bg-red-100 p-3 rounded">${error instanceof Error ? error.message : 'Unknown error'}</pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Sets up navigation event listeners for tool switching.
   */
  #setupNavigation(): void {
    const navButtons = document.querySelectorAll('.unspecd-nav-button');

    navButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const toolId = (event.currentTarget as HTMLElement).getAttribute('data-tool-id');
        if (toolId) {
          this.#setActiveTool(toolId);
        }
      });
    });
  }

  /**
   * Sets the active tool and updates the UI accordingly.
   *
   * @param toolId - The ID of the tool to activate
   */
  #setActiveTool(toolId: string): void {
    const tool = this.#tools.find((t) => t.id === toolId);
    if (!tool) {
      console.warn(`⚠️  Tool with ID "${toolId}" not found`);
      return;
    }

    // Update active navigation state
    document.querySelectorAll('.unspecd-nav-button').forEach((button) => {
      button.classList.remove('active');
      if (button.getAttribute('data-tool-id') === toolId) {
        button.classList.add('active');
      }
    });

    // Update header
    const titleElement = document.getElementById('unspecd-current-title');
    const idElement = document.getElementById('unspecd-current-id');

    if (titleElement) titleElement.textContent = tool.title;
    if (idElement) idElement.textContent = tool.id;

    // Update copy command button
    this.#updateCopyCommand(tool);

    // Update content
    const contentElement = document.getElementById('unspecd-content');
    if (contentElement) {
      contentElement.innerHTML = `<div class="p-6">${this.#renderToolContent(tool)}</div>`;
    }

    console.log(`🎯 Activated tool: ${tool.title} (${tool.id})`);
  }

  /**
   * Updates the copy command button in the header
   *
   * @param tool - The current tool
   */
  #updateCopyCommand(tool: NormalizedTool): void {
    const container = document.getElementById('unspecd-copy-button-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Add copy button if tool has a file path
    if (tool.filePath) {
      const copyButton = document.createElement('button');
      copyButton.className =
        'inline-flex items-center px-4 py-2.5 border border-gray-300/60 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white/90 backdrop-blur-sm hover:bg-white hover:border-gray-400 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-0.5';
      copyButton.innerHTML = `
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        Copy Command
      `;
      copyButton.title = 'Copy unspecd exec command for this tool';

      copyButton.addEventListener('click', () => {
        const command = `unspecd exec ${tool.filePath}`;
        navigator.clipboard
          .writeText(command)
          .then(() => {
            // Provide visual feedback
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = `
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Copied!
          `;
            copyButton.classList.remove(
              'border-gray-300/60',
              'text-gray-700',
              'bg-white/90',
              'hover:bg-white',
              'hover:border-gray-400'
            );
            copyButton.classList.add('border-green-300', 'text-green-700', 'bg-green-50', 'shadow-green-200/50');

            setTimeout(() => {
              copyButton.innerHTML = originalHTML;
              copyButton.classList.remove('border-green-300', 'text-green-700', 'bg-green-50', 'shadow-green-200/50');
              copyButton.classList.add(
                'border-gray-300/60',
                'text-gray-700',
                'bg-white/90',
                'hover:bg-white',
                'hover:border-gray-400'
              );
            }, 2000);
          })
          .catch(() => {
            // Fallback for browsers without clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = command;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            // Provide visual feedback
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = `
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Copied!
          `;
            copyButton.classList.remove(
              'border-gray-300/60',
              'text-gray-700',
              'bg-white/90',
              'hover:bg-white',
              'hover:border-gray-400'
            );
            copyButton.classList.add('border-green-300', 'text-green-700', 'bg-green-50', 'shadow-green-200/50');

            setTimeout(() => {
              copyButton.innerHTML = originalHTML;
              copyButton.classList.remove('border-green-300', 'text-green-700', 'bg-green-50', 'shadow-green-200/50');
              copyButton.classList.add(
                'border-gray-300/60',
                'text-gray-700',
                'bg-white/90',
                'hover:bg-white',
                'hover:border-gray-400'
              );
            }, 2000);
          });
      });

      container.appendChild(copyButton);
    }
  }

  /**
   * Public API: Get the number of registered tools.
   *
   * @returns The number of tools currently registered
   */
  get toolCount(): number {
    return this.#tools.length;
  }

  /**
   * Public API: Get a summary of all registered tools.
   *
   * @returns Array of tool summaries with id and title
   */
  get toolSummary(): Array<{ id: string; title: string }> {
    return this.#tools.map((tool) => ({
      id: tool.id,
      title: tool.title,
    }));
  }

  /**
   * Public API: Get all registered tools with full specifications.
   * Returns the complete normalized tool objects for library mode entry generation.
   *
   * @returns Array of normalized tool objects
   */
  get tools(): NormalizedTool[] {
    return this.#tools;
  }

  /**
   * Public API: Get the focus mode state.
   *
   * @returns Whether this instance is in focus mode
   */
  get focusMode(): boolean {
    return this.#focusMode;
  }

  /**
   * Public API: Get the application title.
   *
   * @returns The application title if set
   */
  get title(): string | undefined {
    return this.#title;
  }

  /**
   * Public API: Get the default server port.
   *
   * @returns The default server port if set
   */
  get port(): number | undefined {
    return this.#port;
  }
}
