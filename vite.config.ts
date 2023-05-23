import { defineConfig } from "vite";
// import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  build: {
    // commonjsOptions: {
    //   include: [],
    // },
    minify: false,
    rollupOptions: {
      // treeshake: 'smallest',
      output: {
        format: "esm",
        dir: "dist",
        manualChunks: function manualChunks(id) {
          // if (id.includes("/node_modules/diff")) {
          //   return "diff";
          // }
          // if (!id.includes('node_modules'))
          // if (id.includes('node_modules')) {
          // if (id.includes('lodash-es')) {
          //   return 'lodash';
          // }

          // if (id.includes('/arr-flatten')) {
          //   return 'arr-flatten';
          // }

          // return 'vendor';
          // } /* else if (id.includes('/app/')) {
          // return 'app';
          // } */
          // if (id.includes('/app/')) {

          //   return 'main';
          // }
        },
      },
      // plugins: [commonjs({
      //   strictRequires: true,
      // })]
    },
  },
  optimizeDeps: {
    // disabled: false,
  },
});
