/**
 * Unit tests for UnspecdUI core functionality
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { UnspecdUI } from '../../src/lib/index.js';
import type { ToolSpec } from '../../src/lib/dsl-schema.js';
import type { ToolConfig } from '../../src/lib/index.js';

// Mock ToolSpec for testing
const mockToolSpec: ToolSpec = {
  id: 'test-tool',
  title: 'Test Tool',
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
    getData: async () => ({ name: 'John Doe', email: 'john@example.com' })
  }
};

const mockToolSpec2: ToolSpec = {
  id: 'test-tool-2',
  title: 'Test Tool 2',
  content: {
    type: 'actionButton',
    buttonConfig: { label: 'Test Action' },
    action: { functionName: 'performAction' }
  },
  functions: {
    performAction: async () => ({ success: true })
  }
};

describe('UnspecdUI Core Functionality', () => {
  describe('Constructor and Tool Registration', () => {
    test('should initialize with empty tools array', () => {
      const ui = new UnspecdUI({ tools: [] });
      expect(ui.toolCount).toBe(0);
      expect(ui.tools).toEqual([]);
    });

    test('should register single tool spec', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec] });
      expect(ui.toolCount).toBe(1);
      expect(ui.tools[0].id).toBe('test-tool');
      expect(ui.tools[0].title).toBe('Test Tool');
    });

    test('should register multiple tool specs', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec, mockToolSpec2] });
      expect(ui.toolCount).toBe(2);
      expect(ui.tools.map(t => t.id)).toEqual(['test-tool', 'test-tool-2']);
    });

    test('should handle ToolConfig objects with custom descriptions', () => {
      const toolConfig: ToolConfig = {
        description: 'Custom Tool Description',
        spec: mockToolSpec,
        filePath: '/path/to/tool.ts'
      };

      const ui = new UnspecdUI({ tools: [toolConfig] });
      expect(ui.toolCount).toBe(1);
      expect(ui.tools[0].title).toBe('Custom Tool Description');
      expect(ui.tools[0].filePath).toBe('/path/to/tool.ts');
    });

    test('should handle mixed ToolSpec and ToolConfig arrays', () => {
      const toolConfig: ToolConfig = {
        description: 'Custom Description',
        spec: mockToolSpec2
      };

      const ui = new UnspecdUI({ tools: [mockToolSpec, toolConfig] });
      expect(ui.toolCount).toBe(2);
      expect(ui.tools[0].title).toBe('Test Tool');
      expect(ui.tools[1].title).toBe('Custom Description');
    });

    test('should set focus mode when specified', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec], focusMode: true });
      expect(ui.focusMode).toBe(true);
    });

    test('should default focus mode to false', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec] });
      expect(ui.focusMode).toBe(false);
    });
  });

  describe('Tool Normalization', () => {
    test('should normalize raw ToolSpec objects', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec] });
      const normalizedTool = ui.tools[0];
      
      expect(normalizedTool.id).toBe(mockToolSpec.id);
      expect(normalizedTool.title).toBe(mockToolSpec.title);
      expect(normalizedTool.spec).toEqual(mockToolSpec);
      expect(normalizedTool.filePath).toBeUndefined();
    });

    test('should normalize ToolConfig objects', () => {
      const toolConfig: ToolConfig = {
        description: 'Custom Title',
        spec: mockToolSpec,
        filePath: '/custom/path.ts'
      };

      const ui = new UnspecdUI({ tools: [toolConfig] });
      const normalizedTool = ui.tools[0];
      
      expect(normalizedTool.id).toBe(mockToolSpec.id);
      expect(normalizedTool.title).toBe('Custom Title');
      expect(normalizedTool.spec).toEqual(mockToolSpec);
      expect(normalizedTool.filePath).toBe('/custom/path.ts');
    });

    test('should handle invalid tool configurations gracefully', () => {
      const invalidTool = { invalid: 'tool' } as any;
      
      expect(() => {
        new UnspecdUI({ tools: [invalidTool] });
      }).toThrow();
    });
  });

  describe('Tool Summary and Metadata', () => {
    test('should provide tool summary', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec, mockToolSpec2] });
      const summary = ui.toolSummary;
      
      expect(summary).toHaveLength(2);
      expect(summary[0]).toEqual({ id: 'test-tool', title: 'Test Tool' });
      expect(summary[1]).toEqual({ id: 'test-tool-2', title: 'Test Tool 2' });
    });

    test('should return correct tool count', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec, mockToolSpec2] });
      expect(ui.toolCount).toBe(2);
    });

    test('should return empty arrays when no tools', () => {
      const ui = new UnspecdUI({ tools: [] });
      expect(ui.toolCount).toBe(0);
      expect(ui.toolSummary).toEqual([]);
      expect(ui.tools).toEqual([]);
    });
  });

  describe('Tool Validation', () => {
    test('should require valid tool ID', () => {
      const invalidTool = {
        ...mockToolSpec,
        id: ''
      };
      
      expect(() => {
        new UnspecdUI({ tools: [invalidTool] });
      }).toThrow();
    });

    test('should require valid tool title', () => {
      const invalidTool = {
        ...mockToolSpec,
        title: ''
      };
      
      expect(() => {
        new UnspecdUI({ tools: [invalidTool] });
      }).toThrow();
    });

    test('should require valid content configuration', () => {
      const invalidTool = {
        ...mockToolSpec,
        content: null as any
      };
      
      expect(() => {
        new UnspecdUI({ tools: [invalidTool] });
      }).toThrow();
    });

    test('should require functions object', () => {
      const invalidTool = {
        ...mockToolSpec,
        functions: null as any
      };
      
      expect(() => {
        new UnspecdUI({ tools: [invalidTool] });
      }).toThrow();
    });
  });

  describe('Tool Access and Retrieval', () => {
    test('should provide access to individual tools', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec, mockToolSpec2] });
      
      expect(ui.tools[0].spec).toEqual(mockToolSpec);
      expect(ui.tools[1].spec).toEqual(mockToolSpec2);
    });

    test('should maintain tool order', () => {
      const ui = new UnspecdUI({ tools: [mockToolSpec2, mockToolSpec] });
      
      expect(ui.tools[0].id).toBe('test-tool-2');
      expect(ui.tools[1].id).toBe('test-tool');
    });
  });
});

describe('UnspecdUI Integration', () => {
  test('should handle complex tool configurations', () => {
    const complexTool: ToolSpec = {
      id: 'complex-tool',
      title: 'Complex Tool',
      inputs: {
        filter: {
          label: 'Filter',
          type: 'text',
          defaultValue: 'all'
        }
      },
      content: {
        type: 'editableTable',
        dataLoader: { functionName: 'loadData' },
        tableConfig: {
          rowIdentifier: 'id',
          columns: [
            { field: 'name', label: 'Name', isEditable: true },
            { field: 'status', label: 'Status', isEditable: true, editorType: 'select' }
          ],
          itemUpdater: { functionName: 'updateItem' }
        }
      },
      functions: {
        loadData: async () => ({ items: [], totalItems: 0 }),
        updateItem: async () => ({ success: true })
      }
    };

    const ui = new UnspecdUI({ tools: [complexTool] });
    expect(ui.toolCount).toBe(1);
    expect(ui.tools[0].spec.inputs).toBeDefined();
    expect(ui.tools[0].spec.content.type).toBe('editableTable');
  });

  test('should handle all content types', () => {
    const displayRecordTool: ToolSpec = {
      id: 'display-record',
      title: 'Display Record',
      content: {
        type: 'displayRecord',
        dataLoader: { functionName: 'getData' },
        displayConfig: { fields: [] }
      },
      functions: { getData: async () => ({}) }
    };

    const actionButtonTool: ToolSpec = {
      id: 'action-button',
      title: 'Action Button',
      content: {
        type: 'actionButton',
        buttonConfig: { label: 'Click Me' },
        action: { functionName: 'doAction' }
      },
      functions: { doAction: async () => ({}) }
    };

    const editFormTool: ToolSpec = {
      id: 'edit-form',
      title: 'Edit Form',
      content: {
        type: 'editForm',
        formConfig: { fields: [] },
        onSubmit: { functionName: 'submitForm' }
      },
      functions: { submitForm: async () => ({}) }
    };

    const ui = new UnspecdUI({
      tools: [displayRecordTool, actionButtonTool, editFormTool]
    });

    expect(ui.toolCount).toBe(3);
    expect(ui.tools.map(t => t.spec.content.type)).toEqual([
      'displayRecord',
      'actionButton', 
      'editForm'
    ]);
  });
}); 