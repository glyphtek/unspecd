/**
 * Promo Code Generator Tool - Edit Form Example for Unspec'd Framework
 * 
 * This example demonstrates the editForm content type for creating new records with:
 * - No dataLoader (for creating new data rather than editing existing)
 * - Various field types (text, number, date)
 * - Form validation and submission handling
 * - Success message confirmation
 */

// When using the published package, you would import like this:
// import type { ToolSpec } from '@glyphtek/unspecd';

// For this example, we use relative paths since we're in the source:
import type { ToolSpec } from '../../src/lib/dsl-schema.js';

/**
 * Complete tool specification for the Promo Code Generator.
 * This tool allows creating new promotional codes with discount and expiry settings.
 */
export const promoCodeGeneratorTool: ToolSpec = {
  id: 'promo-code-generator',
  title: 'Promo Code Generator',
  
  // No inputs needed - this is a standalone creation form
  
  // EditForm content configuration for creating new promo codes
  content: {
    type: 'editForm',
    
    // No dataLoader - this is a creation form, not an edit form
    // dataLoader is omitted intentionally
    
    // Form field configuration
    formConfig: {
      fields: [
        {
          field: 'codeName',
          label: 'Promo Code Name',
          editorType: 'text',
          required: true,
          placeholder: 'Enter promo code (e.g., SAVE20, WELCOME)',
          helpText: 'A unique identifier for this promotional code. Use uppercase letters and numbers.',
          validation: {
            minLength: 3,
            maxLength: 20,
            pattern: '^[A-Z0-9]+$',
            errorMessage: 'Code must be 3-20 characters, uppercase letters and numbers only'
          }
        },
        {
          field: 'discountPercentage',
          label: 'Discount Percentage',
          editorType: 'number',
          required: true,
          placeholder: '10',
          helpText: 'Percentage discount to apply (e.g., 10 for 10% off)',
          validation: {
            min: 1,
            max: 100,
            errorMessage: 'Discount must be between 1% and 100%'
          }
        },
        {
          field: 'expiryDate',
          label: 'Expiry Date',
          editorType: 'date',
          required: true,
          helpText: 'The date when this promo code will expire and become invalid'
        },
        {
          field: 'description',
          label: 'Description',
          editorType: 'textarea',
          required: false,
          placeholder: 'Optional description of this promotional offer...',
          helpText: 'Internal description for this promo code (optional)'
        },
        {
          field: 'isActive',
          label: 'Active Immediately',
          editorType: 'checkbox',
          helpText: 'Whether this promo code should be active immediately after creation',
          defaultValue: true
        },
        {
          field: 'usageLimit',
          label: 'Usage Limit',
          editorType: 'number',
          required: false,
          placeholder: '100',
          helpText: 'Maximum number of times this code can be used (leave empty for unlimited)',
          validation: {
            min: 1,
            errorMessage: 'Usage limit must be at least 1 if specified'
          }
        }
      ],
      
      // Submit button configuration
      submitButton: {
        label: 'Generate Promo Code',
        needsConfirmation: true,
        confirmationMessage: 'Are you sure you want to create this promotional code? It will be available for immediate use.'
      }
    },
    
    // Form submission handler
    onSubmit: {
      functionName: 'createPromoCode',
      onSuccess: {
        message: 'Promotional code created successfully! It is now available for use.',
        redirect: false
      }
    }
  },
  
  // Mock function implementations
  functions: {
    /**
     * Creates a new promotional code with the provided form data.
     * In a real application, this would save to a database or API.
     */
    createPromoCode: async (params: any): Promise<{ success: boolean; message: string; promoCodeId?: string }> => {
      console.log('Creating new promo code with data:', params.formData);
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Extract form data
      const { codeName, discountPercentage, expiryDate, description, isActive, usageLimit } = params.formData;
      
      // Simulate basic validation
      if (!codeName || codeName.trim().length < 3) {
        throw new Error('Promo code name must be at least 3 characters long');
      }
      
      if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
        throw new Error('Discount percentage must be between 1 and 100');
      }
      
      if (!expiryDate) {
        throw new Error('Expiry date is required');
      }
      
      // Check if expiry date is in the future
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      
      // Simulate successful creation
      const mockPromoCodeId = `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Promo code created successfully:', {
        id: mockPromoCodeId,
        codeName,
        discountPercentage: `${discountPercentage}%`,
        expiryDate,
        description: description || 'No description provided',
        isActive,
        usageLimit: usageLimit || 'Unlimited',
        createdAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: `Promo code "${codeName}" has been created successfully with ${discountPercentage}% discount. It will expire on ${new Date(expiryDate).toLocaleDateString()}.`,
        promoCodeId: mockPromoCodeId
      };
    }
  }
}; 