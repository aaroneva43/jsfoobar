import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      output: {
        format: "es",
        dir: 'dist',
        manualChunks: function manualChunks(id) {
          // if (id.includes('node_modules')) {
          //   return 'vendor';
          // }
          // if (id.includes('/app/')) {
          
          //   return 'main';
          // }
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['foo']
  }
});
