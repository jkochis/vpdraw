import { defineConfig } from 'vite'

export default defineConfig({
  // Set the base path to match your GitHub repository name
  base: '/vpdraw/',
  
  build: {
    // Output directory for build files
    outDir: 'dist',
    
    // Generate source maps for debugging
    sourcemap: true,
    
    // Optimize build for production
    minify: 'terser',
    
    // Configure asset handling
    assetsDir: 'assets',
    
    // Rollup options
    rollupOptions: {
      output: {
        // Organize chunks for better caching
        manualChunks: {
          konva: ['konva']
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  }
})
