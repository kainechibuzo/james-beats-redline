import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const ALLOWED_ORIGIN = "https://james-beats-redblack.onrender.com";

export default defineConfig(({ mode }) => ({
  server: {
    host: true, // still bind, but access is filtered
    port: 8080,
    strictPort: true,

    cors: {
      origin: ALLOWED_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },

    allowedHosts: [ "james-beats-redblack.onrender.com" ],
  },

  preview: {
    host: true,
    port: 8080,
    cors: {
      origin: ALLOWED_ORIGIN,
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

