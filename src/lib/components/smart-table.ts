/**
 * Smart Table Component for Unspec'd Framework
 *
 * This component renders a data table with fetching capabilities. It displays
 * tabular data in a clean, professional format with loading states and error handling.
 * This is the initial read-only version that will be extended with editing capabilities.
 */

import { invokeDataSource } from '../data-handler.js';
import type { EditableTableContent, TableColumnConfig } from '../dsl-schema.js';
import { theme } from '../theme.js';

/**
 * Expected structure for table data returned by the data loader function.
 */
interface TableData {
  /** Array of data items to display in the table */
  items: any[];
  /** Total number of items available (for pagination) */
  totalItems: number;
}

/**
 * Helper function to normalize columns array to handle both string[] and TableColumnConfig[] formats.
 * If a column is a string, it creates a default column configuration using the string as the field name
 * and capitalizing it as the label.
 */
function normalizeColumns(columns: string[] | TableColumnConfig[]): TableColumnConfig[] {
  return columns.map((column) => {
    if (typeof column === 'string') {
      // Convert string to default column configuration
      return {
        field: column,
        label: column.charAt(0).toUpperCase() + column.slice(1),
      };
    }
    // Already a TableColumnConfig object
    return column;
  });
}

/**
 * Renders a smart table component that fetches and displays tabular data.
 * This component handles the complete lifecycle from data loading to table display,
 * with proper error handling and loading states.
 *
 * @param content - The EditableTableContent configuration specifying data source and table structure
 * @param specFunctions - Record of functions available from the ToolSpec
 * @param targetElement - The HTML element where the component should be rendered
 *
 * @example
 * ```typescript
 * const content: EditableTableContent = {
 *   type: 'editableTable',
 *   dataLoader: { functionName: 'getUserList' },
 *   tableConfig: {
 *     columns: [
 *       { field: 'id', label: 'ID' },
 *       { field: 'name', label: 'Name' },
 *       { field: 'email', label: 'Email' }
 *     ],
 *     pagination: { defaultPageSize: 10 }
 *   }
 * };
 *
 * renderSmartTableComponent(content, spec.functions, containerElement);
 * ```
 */
export function renderSmartTableComponent(
  content: EditableTableContent,
  specFunctions: Record<string, (params: any) => Promise<any>>,
  targetElement: HTMLElement,
  getInputValues?: () => Record<string, any>,
  setRefreshCallback?: (refresh: () => void) => void
): void {
  // Clear the target element
  targetElement.innerHTML = '';

  // Normalize columns to handle both string[] and TableColumnConfig[] formats
  const normalizedColumns = normalizeColumns(content.tableConfig.columns);

  // State management for pagination
  let currentPage = 1;
  const pageSize = content.tableConfig.pagination?.defaultPageSize || 20;

  // State management for sorting
  let sortBy = content.tableConfig.defaultSort?.field || '';
  let sortDirection: 'asc' | 'desc' = content.tableConfig.defaultSort?.direction || 'asc';

  // State management for inline editing
  let editingRowId: any = null;
  let currentTableData: TableData | null = null;
  let isSaving = false;

  /**
   * Handles clicking on a sortable column header to update sort state.
   */
  function handleSortClick(columnField: string): void {
    if (sortBy === columnField) {
      // Same column - toggle direction
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Different column - set new column and reset to ascending
      sortBy = columnField;
      sortDirection = 'asc';
    }

    // Fetch data from page 1 with new sort order
    fetchAndRenderPage(1);
  }

  /**
   * Handles clicking the Edit button on a row.
   */
  function handleEditClick(itemId: any): void {
    editingRowId = itemId;
    renderTableBody();
  }

  /**
   * Handles clicking the Cancel button during editing.
   */
  function handleCancelClick(): void {
    editingRowId = null;
    isSaving = false;
    renderTableBody();
  }

  /**
   * Handles clicking the Save button during editing.
   */
  async function handleSaveClick(itemId: any, originalItem: any): Promise<void> {
    if (!content.tableConfig.itemUpdater) {
      console.error('No itemUpdater function configured for editing');
      return;
    }

    // Gather values from input fields
    const row = document.querySelector(`tr[data-item-id="${itemId}"]`) as HTMLTableRowElement;
    if (!row) return;

    const changes: any = {};
    let hasChanges = false;

    // Check each editable field for changes
    normalizedColumns.forEach((column) => {
      if (column.isEditable) {
        const input = row.querySelector(`input[data-field="${column.field}"], select[data-field="${column.field}"]`) as
          | HTMLInputElement
          | HTMLSelectElement;
        if (input) {
          const newValue = input.value;
          const oldValue = String(originalItem[column.field] || '');

          if (newValue !== oldValue) {
            changes[column.field] = newValue;
            hasChanges = true;
          }
        }
      }
    });

    // If no changes, just cancel editing
    if (!hasChanges) {
      handleCancelClick();
      return;
    }

    // Set saving state
    isSaving = true;
    renderTableBody();

    // Call the itemUpdater function
    await invokeDataSource({
      specFunctions,
      functionName: content.tableConfig.itemUpdater.functionName,
      params: {
        itemId: itemId,
        changes: changes,
        currentItem: originalItem,
      },

      onPending: () => {
        console.log(`Saving changes for item ${itemId}:`, changes);
      },

      onFulfilled: (updatedItem: any) => {
        // Update the item in our local data
        if (currentTableData?.items) {
          const itemIndex = currentTableData.items.findIndex((item) => item.id === itemId);
          if (itemIndex !== -1) {
            currentTableData.items[itemIndex] = updatedItem || { ...originalItem, ...changes };
          }
        }

        // Reset editing state
        editingRowId = null;
        isSaving = false;

        // Re-render the table body with updated data
        renderTableBody();

        console.log('Item updated successfully:', updatedItem || changes);
      },

      onRejected: (error: Error) => {
        // Reset saving state but keep in edit mode
        isSaving = false;
        renderTableBody();

        // Show error to user
        window.alert(`Failed to save changes: ${error.message}`);

        console.error('Save operation failed:', error);
      },
    });
  }

  /**
   * Creates a table cell for a specific column and item
   * @param column - The column configuration
   * @param item - The data item
   * @param isEditing - Whether the row is in editing mode
   * @returns The created table cell element
   */
  function createTableCell(column: TableColumnConfig, item: any, isEditing: boolean): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

    if (isEditing && column.isEditable) {
      // Render input field for editable columns in edit mode
      const input = document.createElement('input');
      input.type = 'text';
      input.value = String(item[column.field] || '');
      input.setAttribute('data-field', column.field);
      input.className = `${theme.textInput} w-full`;
      td.appendChild(input);
    } else {
      // Render text value for non-editable columns or read mode
      const fieldValue = item[column.field];

      if (fieldValue == null) {
        td.textContent = '—';
        td.className += ' text-gray-400 italic';
      } else {
        const displayValue = String(fieldValue);
        td.textContent = displayValue;

        if (displayValue.length > 50) {
          td.className += ' truncate max-w-xs';
          td.title = displayValue;
        }
      }
    }

    return td;
  }

  /**
   * Creates the actions cell for a table row
   * @param item - The data item
   * @param index - The row index
   * @param isEditing - Whether the row is in editing mode
   * @returns The created actions cell element
   */
  function createActionsCell(item: any, index: number, isEditing: boolean): HTMLTableCellElement {
    const actionsTd = document.createElement('td');
    actionsTd.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';

    if (isEditing) {
      // Edit mode: Save and Cancel buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex space-x-2';

      const saveButton = document.createElement('button');
      saveButton.textContent = isSaving ? 'Saving...' : 'Save';
      saveButton.className = theme.button.primary;
      saveButton.disabled = isSaving;

      if (isSaving) {
        saveButton.className = saveButton.className.replace(
          'bg-blue-600 hover:bg-blue-700',
          'bg-gray-400 cursor-not-allowed'
        );
      }

      saveButton.addEventListener('click', () => {
        handleSaveClick(item.id || index, item);
      });

      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.className = theme.button.secondary;
      cancelButton.disabled = isSaving;

      if (isSaving) {
        cancelButton.className = cancelButton.className.replace(
          'bg-gray-100 hover:bg-gray-200',
          'bg-gray-50 cursor-not-allowed'
        );
      }

      cancelButton.addEventListener('click', handleCancelClick);

      buttonContainer.appendChild(saveButton);
      buttonContainer.appendChild(cancelButton);
      actionsTd.appendChild(buttonContainer);
    } else {
      // Read mode: Edit button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.className = theme.button.secondary;

      editButton.addEventListener('click', () => {
        handleEditClick(item.id || index);
      });

      actionsTd.appendChild(editButton);
    }

    return actionsTd;
  }

  /**
   * Creates a complete table row for a data item
   * @param item - The data item
   * @param index - The row index
   * @returns The created table row element
   */
  function createTableRow(item: any, index: number): HTMLTableRowElement {
    const row = document.createElement('tr');
    row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    row.setAttribute('data-item-id', item.id || index);

    const isEditing = editingRowId === (item.id || index);

    // Create cells for each column
    normalizedColumns.forEach((column) => {
      const td = createTableCell(column, item, isEditing);
      row.appendChild(td);
    });

    // Add actions column only if editing is enabled
    if (content.tableConfig.itemUpdater) {
      const actionsTd = createActionsCell(item, index, isEditing);
      row.appendChild(actionsTd);
    }

    return row;
  }

  /**
   * Renders the table body with data rows.
   * Handles case where no data is available.
   */
  function renderTableBody(tbody?: HTMLTableSectionElement): void {
    const tableBody = tbody || (document.querySelector('#unspecd-table-body') as HTMLTableSectionElement);
    if (!tableBody || !currentTableData) {
      console.warn('Table body element not found or no data available');
      return;
    }

    // Clear existing content
    tableBody.innerHTML = '';

    // Create rows for each data item using the helper function
    currentTableData.items.forEach((item, index) => {
      const row = createTableRow(item, index);
      tableBody.appendChild(row);
    });
  }

  /**
   * Creates a header cell (th) for a specific column
   * @param column - The column configuration
   * @returns The created header cell element
   */
  function createHeaderCell(column: TableColumnConfig): HTMLTableCellElement {
    const th = document.createElement('th');
    th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';

    if (column.isSortable) {
      // Create clickable button for sortable columns
      const sortButton = document.createElement('button');
      sortButton.className =
        'hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200';

      // Set button text with sort indicator
      let buttonText = column.label;
      if (sortBy === column.field) {
        buttonText += sortDirection === 'asc' ? ' ▲' : ' ▼';
      }
      sortButton.textContent = buttonText;

      // Add click handler for sorting
      sortButton.addEventListener('click', () => {
        handleSortClick(column.field);
      });

      th.appendChild(sortButton);
    } else {
      // Non-sortable column - just show the label
      th.textContent = column.label;
    }

    return th;
  }

  /**
   * Creates the actions header cell
   * @returns The created actions header cell element
   */
  function createActionsHeaderCell(): HTMLTableCellElement {
    const actionsTh = document.createElement('th');
    actionsTh.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    actionsTh.textContent = 'Actions';
    return actionsTh;
  }

  /**
   * Validates the table data structure
   * @param data - The data to validate
   * @returns true if valid, false otherwise
   */
  function validateTableData(data: TableData): boolean {
    return data && Array.isArray(data.items);
  }

  /**
   * Renders an invalid data format error
   */
  function renderInvalidDataError(): void {
    const errorElement = document.createElement('div');
    errorElement.className = theme.feedback.error;

    const errorTitle = document.createElement('strong');
    errorTitle.textContent = 'Invalid Data Format';
    errorTitle.className = 'block font-semibold mb-2';

    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Expected data format: { items: any[], totalItems: number }';
    errorMessage.className = 'text-sm';

    errorElement.appendChild(errorTitle);
    errorElement.appendChild(errorMessage);
    targetElement.appendChild(errorElement);
  }

  /**
   * Renders an empty data state
   */
  function renderEmptyDataState(): void {
    const noDataElement = document.createElement('div');
    noDataElement.className = theme.data.noData;
    noDataElement.textContent = 'No data available';
    targetElement.appendChild(noDataElement);
  }

  /**
   * Creates the table structure with header
   * @param data - The table data
   * @returns The table container and table elements
   */
  function createTableStructure(data: TableData): {
    tableContainer: HTMLElement;
    table: HTMLTableElement;
    tbody: HTMLTableSectionElement;
  } {
    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm';

    // Create table element
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';

    // Create table header
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';

    const headerRow = document.createElement('tr');

    // Create header cells for each column
    normalizedColumns.forEach((column) => {
      const th = createHeaderCell(column);
      headerRow.appendChild(th);
    });

    // Add Actions header column if editing is enabled
    if (content.tableConfig.itemUpdater) {
      const actionsTh = createActionsHeaderCell();
      headerRow.appendChild(actionsTh);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Store current data for editing operations
    currentTableData = data;

    // Create table body
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    tbody.id = 'table-body';

    table.appendChild(tbody);

    return { tableContainer, table, tbody };
  }

  /**
   * Creates the table footer with item count information
   * @param data - The table data
   * @returns The footer element
   */
  function createTableFooter(data: TableData): HTMLElement {
    const footerInfo = document.createElement('div');
    footerInfo.className = 'px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700';

    const totalText =
      data.totalItems !== undefined
        ? `Showing ${data.items.length} of ${data.totalItems} items`
        : `Showing ${data.items.length} items`;

    footerInfo.textContent = totalText;
    return footerInfo;
  }

  /**
   * Renders the complete table with data
   * @param data - The table data to render
   */
  function renderCompleteTable(data: TableData): void {
    const { tableContainer, table, tbody } = createTableStructure(data);

    // Render the table body content
    renderTableBody(tbody);
    tableContainer.appendChild(table);

    // Create and add footer
    const footerInfo = createTableFooter(data);
    tableContainer.appendChild(footerInfo);

    // Add table container to target element
    targetElement.appendChild(tableContainer);

    // Add pagination controls if there are multiple pages
    if (data.totalItems && data.totalItems > pageSize) {
      const totalPages = Math.ceil(data.totalItems / pageSize);
      renderPaginationControls(totalPages);
    }

    console.log('Table rendered successfully:', {
      items: data.items.length,
      totalItems: data.totalItems,
      currentPage: currentPage,
      sortBy: sortBy,
      sortDirection: sortDirection,
    });
  }

  /**
   * Internal function to fetch data and render the table for a specific page.
   * This encapsulates all the data fetching and rendering logic.
   */
  async function fetchAndRenderPage(page: number): Promise<void> {
    currentPage = page;

    // Prepare pagination and sorting parameters
    const params = {
      page: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDirection: sortDirection,
      // Include input values if available
      ...(getInputValues ? getInputValues() : {}),
    };

    // Fetch table data using the invokeDataSource utility
    await invokeDataSource({
      specFunctions,
      functionName: content.dataLoader.functionName,
      params: params,

      onPending: () => {
        // Render loading state
        targetElement.innerHTML = '';

        const loadingElement = document.createElement('p');
        loadingElement.textContent = 'Loading table data...';
        loadingElement.className = theme.feedback.loading;

        targetElement.appendChild(loadingElement);

        console.log(`Loading table data using function: ${content.dataLoader.functionName}, page: ${page}`);
      },

      onFulfilled: (data: TableData) => {
        // Clear the target element
        targetElement.innerHTML = '';

        // Validate data structure
        if (!validateTableData(data)) {
          renderInvalidDataError();
          return;
        }

        // Handle empty data
        if (data.items.length === 0) {
          renderEmptyDataState();
          return;
        }

        // Render the complete table
        renderCompleteTable(data);
      },

      onRejected: (error: Error) => {
        // Clear the target element
        targetElement.innerHTML = '';

        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = theme.feedback.error;

        // Create error title
        const errorTitle = document.createElement('strong');
        errorTitle.textContent = 'Failed to Load Table Data';
        errorTitle.className = 'block font-semibold mb-2';

        // Create error message
        const errorMessage = document.createElement('p');
        errorMessage.textContent = error.message;
        errorMessage.className = 'text-sm';

        // Append elements to error container
        errorContainer.appendChild(errorTitle);
        errorContainer.appendChild(errorMessage);

        // Add error container to target element
        targetElement.appendChild(errorContainer);

        console.error('Smart Table Component Error:', error);
      },
    });
  }

  /**
   * Renders pagination controls (Previous/Next buttons and page info).
   */
  function renderPaginationControls(totalPages: number): void {
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200';

    // Create page info text
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.className = 'text-sm text-gray-700';

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex space-x-2';

    // Create Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = theme.button.primary;

    // Disable Previous button if on first page
    if (currentPage === 1) {
      prevButton.disabled = true;
      prevButton.className = prevButton.className.replace(
        'bg-blue-600 hover:bg-blue-700',
        'bg-gray-400 cursor-not-allowed'
      );
    }

    // Add click handler for Previous button
    prevButton.addEventListener('click', async () => {
      if (currentPage > 1) {
        await fetchAndRenderPage(currentPage - 1);
      }
    });

    // Create Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = theme.button.primary;

    // Disable Next button if on last page
    if (currentPage === totalPages) {
      nextButton.disabled = true;
      nextButton.className = nextButton.className.replace(
        'bg-blue-600 hover:bg-blue-700',
        'bg-gray-400 cursor-not-allowed'
      );
    }

    // Add click handler for Next button
    nextButton.addEventListener('click', async () => {
      if (currentPage < totalPages) {
        await fetchAndRenderPage(currentPage + 1);
      }
    });

    // Append buttons to button container
    buttonContainer.appendChild(prevButton);
    buttonContainer.appendChild(nextButton);

    // Append elements to pagination container
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(buttonContainer);

    // Add pagination container to target element
    targetElement.appendChild(paginationContainer);
  }

  // Provide the refresh function to the parent
  if (setRefreshCallback) {
    setRefreshCallback(() => fetchAndRenderPage(1));
  }

  // Initialize by fetching and rendering the first page
  fetchAndRenderPage(1);
}
