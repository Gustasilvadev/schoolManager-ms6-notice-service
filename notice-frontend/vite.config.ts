/// <reference types="node" />

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (!env.API_PROXY_BASE) {
    throw new Error("API_PROXY_BASE não foi encontrada no .env");
  }

  return {
    plugins: [react()],

    server: {
      proxy: {
        "/api": {
          target: env.API_PROXY_BASE,
          changeOrigin: true,
        },
      },
    },
  };
});