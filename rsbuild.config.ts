import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import path from "path";

const { publicVars } = loadEnv({ prefixes: ["VITE_"] });

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/main.tsx",
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    define: publicVars,
  },
  html: {
    template: "./index.html",
  },
});
