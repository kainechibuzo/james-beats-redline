// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var ALLOWED_ORIGIN = "https://james-beats-redblack.onrender.com";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: true,
    // bind to all interfaces
    port: 8080,
    strictPort: true,
    cors: {
      origin: ALLOWED_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true
    },
    allowedHosts: ["james-beats-redblack.onrender.com"]
  },
  preview: {
    host: true,
    port: 8080,
    strictPort: true,
    cors: {
      origin: ALLOWED_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true
    }
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
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
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
                maxAgeSeconds: 60 * 60 * 24
                // 1 day
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG5cbmNvbnN0IEFMTE9XRURfT1JJR0lOID0gXCJodHRwczovL2phbWVzLWJlYXRzLXJlZGJsYWNrLm9ucmVuZGVyLmNvbVwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLCAvLyBiaW5kIHRvIGFsbCBpbnRlcmZhY2VzXG4gICAgcG9ydDogODA4MCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGNvcnM6IHtcbiAgICAgIG9yaWdpbjogQUxMT1dFRF9PUklHSU4sXG4gICAgICBtZXRob2RzOiBbXCJHRVRcIiwgXCJQT1NUXCIsIFwiUFVUXCIsIFwiREVMRVRFXCIsIFwiT1BUSU9OU1wiXSxcbiAgICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxuICAgIH0sXG4gICAgYWxsb3dlZEhvc3RzOiBbXCJqYW1lcy1iZWF0cy1yZWRibGFjay5vbnJlbmRlci5jb21cIl0sXG4gIH0sXG5cbiAgcHJldmlldzoge1xuICAgIGhvc3Q6IHRydWUsXG4gICAgcG9ydDogODA4MCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGNvcnM6IHtcbiAgICAgIG9yaWdpbjogQUxMT1dFRF9PUklHSU4sXG4gICAgICBtZXRob2RzOiBbXCJHRVRcIiwgXCJQT1NUXCIsIFwiUFVUXCIsIFwiREVMRVRFXCIsIFwiT1BUSU9OU1wiXSxcbiAgICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxuICAgIH0sXG4gIH0sXG5cbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgIGluY2x1ZGVBc3NldHM6IFtcImZhdmljb24uc3ZnXCIsIFwicm9ib3RzLnR4dFwiLCBcImljb25zLyoucG5nXCIsIFwibWFuaWZlc3Qud2VibWFuaWZlc3RcIl0sXG4gICAgICBtYW5pZmVzdEZpbGVuYW1lOiBcIm1hbmlmZXN0LndlYm1hbmlmZXN0XCIsXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiBcIkphbWVzIEJlYXRzXCIsXG4gICAgICAgIHNob3J0X25hbWU6IFwiSkJlYXRzXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlByZW1pdW0gbXVzaWMgc3RyZWFtaW5nIC0gU3RyZWFtIG1pbGxpb25zIG9mIHNvbmdzXCIsXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiMyMmM1NWVcIixcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogXCIjMDUwYTA3XCIsXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxuICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxuICAgICAgICBvcmllbnRhdGlvbjogXCJwb3J0cmFpdC1wcmltYXJ5XCIsXG4gICAgICAgIGNhdGVnb3JpZXM6IFtcIm11c2ljXCIsIFwiZW50ZXJ0YWlubWVudFwiXSxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL2ljb25zL2ljb24tMTkyeDE5Mi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICBwdXJwb3NlOiBcImFueSBtYXNrYWJsZVwiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9pY29ucy9pY29uLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgcHVycG9zZTogXCJhbnkgbWFza2FibGVcIixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcLy4qXFwuc3VwYWJhc2VcXC5jb1xcLy4qJC8sXG4gICAgICAgICAgICBoYW5kbGVyOiBcIk5ldHdvcmtGaXJzdFwiLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwic3VwYWJhc2Utc3RvcmFnZVwiLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCwgLy8gMSBkYXlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTSxpQkFBaUI7QUFFdkIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxNQUNKLFFBQVE7QUFBQSxNQUNSLFNBQVMsQ0FBQyxPQUFPLFFBQVEsT0FBTyxVQUFVLFNBQVM7QUFBQSxNQUNuRCxhQUFhO0FBQUEsSUFDZjtBQUFBLElBQ0EsY0FBYyxDQUFDLG1DQUFtQztBQUFBLEVBQ3BEO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsTUFDSixRQUFRO0FBQUEsTUFDUixTQUFTLENBQUMsT0FBTyxRQUFRLE9BQU8sVUFBVSxTQUFTO0FBQUEsTUFDbkQsYUFBYTtBQUFBLElBQ2Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxJQUMxQyxRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZSxjQUFjLGVBQWUsc0JBQXNCO0FBQUEsTUFDbEYsa0JBQWtCO0FBQUEsTUFDbEIsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsYUFBYTtBQUFBLFFBQ2IsWUFBWSxDQUFDLFNBQVMsZUFBZTtBQUFBLFFBQ3JDLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLGdCQUFnQjtBQUFBLFVBQ2Q7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVk7QUFBQSxnQkFDVixZQUFZO0FBQUEsZ0JBQ1osZUFBZSxLQUFLLEtBQUs7QUFBQTtBQUFBLGNBQzNCO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUVoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
