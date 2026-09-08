import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SPA_ROUTES = [
  "login",
  "register",
  "privacy",
  "dashboard",
  "vehicles",
  "drivers",
  "trips",
  "maintenance",
  "fuel",
  "reports",
  "settings",
];

function emitSpaRouteFiles(): Plugin {
  return {
    name: "transpilot-spa-route-files",
    closeBundle() {
      const dist = join(process.cwd(), "dist");
      const indexFile = join(dist, "index.html");

      for (const route of SPA_ROUTES) {
        const routeDir = join(dist, route);
        mkdirSync(routeDir, { recursive: true });
        copyFileSync(indexFile, join(routeDir, "index.html"));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), emitSpaRouteFiles()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
