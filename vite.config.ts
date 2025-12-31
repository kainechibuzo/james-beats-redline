import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const ALLOWED_ORIGIN = "https://james-beats-redblack.onrender.com";

export default defineConfig(({ mode }) => ({
  server: {
    host: true, // bind to all interfaces
    port: 8080,
    strictPort: true,
    cors: {
      origin: ALLOWED_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
    allowedHosts: ["james-beats-redblack.onrender.com"],
  },

  preview: {
    host: true,
    port: 8080,
    strictPort: true,
    cors: {
      origin: ALLOWED_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "icons/*.png", "manifest.webmanifest"],
      manifestFilename: "manifest.webmanifest",
      manifest: {
        name: "James Beats",
        short_name: "JBeats",
        description: "Premium music streaming - Stream millions of songs",
        theme_color: "#22c55e",
        background_color: "#050a07",
        display: "standalone",
        start_url: "/",
        orientation: "portrait-primary",
        categories: ["music", "entertainment"],
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-storage",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
