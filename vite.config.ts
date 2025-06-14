import { defineConfig } from 'vite';

export default defineConfig({
  // Exclude native dependencies that don't work in the browser
  optimizeDeps: {
    exclude: [
      'fsevents',
      'lightningcss'
    ],
    // Include common dependencies to avoid duplication
    include: [
      'glob'
    ]
  },
  
  // External dependencies that should not be bundled
  build: {
    rollupOptions: {
      external: [
        'fsevents',
        'lightningcss'
      ]
    }
  },
  
  // Server configuration for development
  server: {
    fs: {
      // Allow serving files from the project root and parent directories
      allow: ['..']
    }
  },
  
  // Fix for module duplication
  resolve: {
    dedupe: ['vite']
  }
}); 