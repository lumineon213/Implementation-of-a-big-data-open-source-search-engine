import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8484",
        changeOrigin: true,
        secure: false,
      },
      "/solr": {
        target: "http://localhost:8983", // Solr 기본 포트 번호
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      pages: path.resolve(__dirname, "src/pages"),
      components: path.resolve(__dirname, "src/components"),
      api: path.resolve(__dirname, "src/api"),
      styles: path.resolve(__dirname, "src/styles"),
      hooks: path.resolve(__dirname, "src/hooks"),
      layouts: path.resolve(__dirname, "src/layouts"),
    },
  },
});
