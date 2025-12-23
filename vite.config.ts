import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "firebase";
            if (id.includes("framer-motion")) return "framer-motion";
            if (id.includes("lucide-react")) return "icons";

            if (
              id.includes("@radix-ui") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "ui-libs";
            }

            return "vendor";
          }
        },
      },
    },
  },
});
