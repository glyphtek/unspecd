/**
 * Streaming Table Component for Unspec'd Framework
 *
 * This component handles real-time data streams and updates the table DOM
 * dynamically as new events arrive. It manages internal state for efficient
 * lookups and provides smooth visual updates for streaming data.
 */

// Declare global types for tools data
declare global {
  interface Window {
    __UNSPECD_TOOLS_DATA__:
      | {
          tools: Array<{
            id: string;
            title: string;
            inputs: any;
            content: any;
            functionNames: string[];
            filePath?: string;
          }>;
          toolCount: number;
          focusMode: boolean;
          title?: string;
        }
      | undefined;
  }
}

/**
 * Interface for streaming table configuration.
 * This matches the conceptual design from live-orders-dashboard.ts
 */
interface StreamingTableContent {
  type: 'streamingTable';
  dataSource: {
    type: 'stream';
    functionName: string;
  };
  tableConfig: {
    rowIdentifier: string;
    columns: Array<{
      field: string;
      label: string;
      formatter?: string;
      width?: string;
    }>;
    streamingOptions?: {
      highlightNewRows?: boolean;
      showUpdateAnimations?: boolean;
      maxRows?: number;
    };
  };
}

/**
 * Type definitions for streaming events
 */
type StreamEvent =
  | { type: 'add'; item: any }
  | { type: 'update'; itemId: string; changes: any }
  | { type: 'delete'; itemId: string }
  | { type: 'replace'; items: any[] }
  | { type: 'clear' };

/**
 * Main renderer for streamingTable content type.
 * Manages real-time data streams and updates the table DOM dynamically.
 *
 * @param content - The streamingTable content configuration
 * @param specFunctions - The functions record from the ToolSpec
 * @param targetElement - The HTML element to render into
 */
export async function renderStreamingTableComponent(
  content: StreamingTableContent,
  _specFunctions: Record<string, (params: any) => Promise<any>>,
  targetElement: HTMLElement
): Promise<void> {
  // Clear the target element
  targetElement.innerHTML = '';

  // Create container for the streaming table
  const tableContainer = document.createElement('div');
  tableContainer.className = 'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden';

  // Create status bar
  const statusBar = document.createElement('div');
  statusBar.className = 'px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between';
  statusBar.innerHTML = `
    <div class="flex items-center space-x-2">
      <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" id="connection-indicator"></div>
      <span class="text-sm text-gray-600" id="status-text">Connecting to live feed...</span>
    </div>
    <div class="text-xs text-gray-500" id="row-count">0 rows</div>
  `;

  // Create table structure
  const table = document.createElement('table');
  table.className = 'w-full';

  // Create table header
  const thead = document.createElement('thead');
  thead.className = 'bg-gray-50';

  const headerRow = document.createElement('tr');
  content.tableConfig.columns.forEach((column) => {
    const th = document.createElement('th');
    th.className = 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    th.textContent = column.label;
    if (column.width) {
      th.style.width = column.width;
    }
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');
  tbody.className = 'bg-white divide-y divide-gray-200';
  tbody.id = 'streaming-table-body';
  table.appendChild(tbody);

  // Assemble the table
  tableContainer.appendChild(statusBar);
  tableContainer.appendChild(table);
  targetElement.appendChild(tableContainer);

  // Internal state management
  const rowData = new Map<string, any>();
  let _unsubscribeFunction: (() => void) | null = null;

  // Helper function to format cell values
  function formatValue(value: any, formatter?: string): string {
    if (value == null) return 'N/A';

    switch (formatter?.toLowerCase()) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(value));
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'time':
        return new Date(value).toLocaleTimeString();
      default:
        return String(value);
    }
  }

  // Helper function to create a table row
  function createTableRow(item: any): HTMLTableRowElement {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors duration-150';
    row.setAttribute('data-row-id', item[content.tableConfig.rowIdentifier]);

    content.tableConfig.columns.forEach((column) => {
      const cell = document.createElement('td');
      cell.className = 'px-4 py-3 text-sm text-gray-900';
      cell.textContent = formatValue(item[column.field], column.formatter);
      row.appendChild(cell);
    });

    return row;
  }

  // Helper function to update row count display
  function updateRowCount(): void {
    const rowCountElement = document.getElementById('row-count');
    if (rowCountElement) {
      const count = rowData.size;
      rowCountElement.textContent = `${count} row${count !== 1 ? 's' : ''}`;
    }
  }

  // Helper function to apply highlight effect to new rows
  function highlightNewRow(row: HTMLTableRowElement): void {
    if (content.tableConfig.streamingOptions?.highlightNewRows) {
      row.classList.add('bg-blue-50', 'border-l-4', 'border-blue-400');

      // Remove highlight after 3 seconds
      setTimeout(() => {
        row.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-400');
      }, 3000);
    }
  }

  // Helper function to apply update animation
  function animateRowUpdate(row: HTMLTableRowElement): void {
    if (content.tableConfig.streamingOptions?.showUpdateAnimations) {
      row.classList.add('bg-yellow-50');

      // Remove animation after 1 second
      setTimeout(() => {
        row.classList.remove('bg-yellow-50');
      }, 1000);
    }
  }

  // Helper function to enforce max rows limit
  function enforceMaxRows(): void {
    const maxRows = content.tableConfig.streamingOptions?.maxRows;
    if (maxRows && rowData.size > maxRows) {
      // Remove oldest rows (this is a simple implementation)
      const rowsToRemove = Array.from(rowData.keys()).slice(0, rowData.size - maxRows);
      rowsToRemove.forEach((rowId) => {
        rowData.delete(rowId);
        const rowElement = tbody.querySelector(`[data-row-id="${rowId}"]`);
        if (rowElement) {
          rowElement.remove();
        }
      });
    }
  }

  // onData callback - handles all streaming events
  const onData = (event: StreamEvent): void => {
    console.log('📊 Streaming event received:', event);

    switch (event.type) {
      case 'add': {
        const item = event.item;
        const rowId = item[content.tableConfig.rowIdentifier];

        // Add to internal state
        rowData.set(rowId, item);

        // Create and add DOM element
        const newRow = createTableRow(item);

        // Add to top of table (most recent first)
        if (tbody.firstChild) {
          tbody.insertBefore(newRow, tbody.firstChild);
        } else {
          tbody.appendChild(newRow);
        }

        // Apply visual effects
        highlightNewRow(newRow);

        // Enforce row limits
        enforceMaxRows();

        // Update row count
        updateRowCount();
        break;
      }

      case 'update': {
        const { itemId, changes } = event;

        // Update internal state
        const existingItem = rowData.get(itemId);
        if (existingItem) {
          const updatedItem = { ...existingItem, ...changes };
          rowData.set(itemId, updatedItem);

          // Update DOM element
          const rowElement = tbody.querySelector(`[data-row-id="${itemId}"]`) as HTMLTableRowElement;
          if (rowElement) {
            // Update each cell
            const cells = rowElement.querySelectorAll('td');
            content.tableConfig.columns.forEach((column, index) => {
              if (cells[index]) {
                cells[index].textContent = formatValue(updatedItem[column.field], column.formatter);
              }
            });

            // Apply update animation
            animateRowUpdate(rowElement);
          }
        }
        break;
      }

      case 'delete': {
        const { itemId } = event;

        // Remove from internal state
        rowData.delete(itemId);

        // Remove from DOM
        const rowElement = tbody.querySelector(`[data-row-id="${itemId}"]`);
        if (rowElement) {
          rowElement.remove();
        }

        // Update row count
        updateRowCount();
        break;
      }

      case 'replace': {
        // Clear existing data
        rowData.clear();
        tbody.innerHTML = '';

        // Add all new items
        event.items.forEach((item) => {
          const rowId = item[content.tableConfig.rowIdentifier];
          rowData.set(rowId, item);

          const newRow = createTableRow(item);
          tbody.appendChild(newRow);
        });

        // Update row count
        updateRowCount();
        break;
      }

      case 'clear': {
        // Clear all data
        rowData.clear();
        tbody.innerHTML = '';
        updateRowCount();
        break;
      }

      default:
        console.warn('Unknown streaming event type:', (event as any).type);
    }
  };

  // onError callback
  const onError = (error: Error): void => {
    console.error('❌ Streaming table error:', error);

    const statusText = document.getElementById('status-text');
    const indicator = document.getElementById('connection-indicator');

    if (statusText && indicator) {
      statusText.textContent = `Error: ${error.message}`;
      indicator.className = 'w-2 h-2 bg-red-500 rounded-full';
    }
  };

  // onConnect callback
  const onConnect = (): void => {
    console.log('✅ Streaming table connected');

    const statusText = document.getElementById('status-text');
    const indicator = document.getElementById('connection-indicator');

    if (statusText && indicator) {
      statusText.textContent = 'Connected to live feed';
      indicator.className = 'w-2 h-2 bg-green-500 rounded-full';
    }
  };

  // onDisconnect callback
  const onDisconnect = (): void => {
    console.log('⚠️ Streaming table disconnected');

    const statusText = document.getElementById('status-text');
    const indicator = document.getElementById('connection-indicator');

    if (statusText && indicator) {
      statusText.textContent = 'Disconnected from live feed';
      indicator.className = 'w-2 h-2 bg-gray-400 rounded-full';
    }
  };

  try {
    // Connect to WebSocket for streaming data
    const wsPort = window.location.port ? Number.parseInt(window.location.port) + 1 : 3001;
    const wsUrl = `ws://${window.location.hostname}:${wsPort}`;

    console.log(`🔌 Connecting to WebSocket at ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🔌 WebSocket connected');

      // Find the tool ID from the specFunctions object
      // We need to extract the tool ID from the context
      let toolId = '';

      // Try to find the tool ID by looking for the function name in the global tools data
      if (window.__UNSPECD_TOOLS_DATA__) {
        const tool = window.__UNSPECD_TOOLS_DATA__.tools.find((t: any) =>
          t.functionNames.includes(content.dataSource.functionName)
        );
        if (tool) {
          toolId = tool.id;
        }
      }

      if (!toolId) {
        onError(new Error(`Could not find tool ID for function '${content.dataSource.functionName}'`));
        return;
      }

      // Start the stream
      ws.send(
        JSON.stringify({
          type: 'start-stream',
          toolId,
          functionName: content.dataSource.functionName,
          params: {},
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'data':
            onData(message.event);
            break;
          case 'error':
            onError(new Error(message.error));
            break;
          case 'connect':
            onConnect();
            break;
          case 'disconnect':
            onDisconnect();
            break;
          default:
            console.warn('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Failed to parse WebSocket message'));
      }
    };

    ws.onerror = (error) => {
      console.error('🔌 WebSocket error:', error);
      onError(new Error('WebSocket connection error'));
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      onDisconnect();
    };

    // Store WebSocket for cleanup
    _unsubscribeFunction = () => {
      console.log('🔌 Closing WebSocket connection');
      ws.close();
    };

    console.log('🚀 Streaming table initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize streaming table:', error);
    onError(error instanceof Error ? error : new Error('Unknown initialization error'));
  }

  // TODO: Lifecycle Management
  // In a full component system, the UnspecdUI shell would be responsible for
  // calling the unsubscribe function when the component is unmounted to prevent
  // memory leaks and stop ongoing streams.
  //
  // Example cleanup that would be called by the framework:
  // if (unsubscribeFunction) {
  //   unsubscribeFunction();
  //   unsubscribeFunction = null;
  // }

  console.log('📋 Streaming table component rendered with', content.tableConfig.columns.length, 'columns');
}
