import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import path from "path";
import pkg from "./package.json";

const previewSecurityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' blob: 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const devSecurityHeaders = {
  ...previewSecurityHeaders,
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' blob: 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

function getManualChunk(id: string) {
  if (!id.includes("node_modules")) return undefined;

  if (
    id.includes("/react/") ||
    id.includes("/react-dom/") ||
    id.includes("react-router-dom")
  ) {
    return "vendor";
  }

  if (
    id.includes("@tanstack/react-query") ||
    id.includes("@tanstack/react-table")
  ) {
    return "tanstack";
  }

  if (id.includes("@react-three/fiber")) {
    return "three-fiber";
  }

  if (id.includes("@react-three/drei") || id.includes("camera-controls")) {
    return "three-drei";
  }

  if (id.includes("/three/")) {
    return "three-core";
  }

  if (id.includes("/d3-") || id.includes("/dagre-d3/")) {
    return "mermaid-graph";
  }

  if (id.includes("/cytoscape/")) {
    return "cytoscape";
  }

  if (id.includes("/katex/")) {
    return "katex";
  }

  return undefined;
}

export default defineConfig(({ mode }) => {
  const isElectron = mode === "electron";

  return {
    plugins: [
      react(),
      ...(isElectron
        ? [
            electron([
              {
                entry: "electron/main.ts",
                onstart(options) {
                  options.startup();
                },
                vite: {
                  build: {
                    outDir: "dist-electron",
                  },
                },
              },
              {
                entry: "electron/preload.ts",
                onstart(options) {
                  options.reload();
                },
                vite: {
                  build: {
                    outDir: "dist-electron",
                  },
                },
              },
            ]),
            renderer(),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@domain": path.resolve(__dirname, "./src/domain"),
        "@application": path.resolve(__dirname, "./src/application"),
        "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
        "@presentation": path.resolve(__dirname, "./src/presentation"),
        "@shared": path.resolve(__dirname, "./src/shared"),
      },
    },
    optimizeDeps: {
      include: ["mermaid"],
    },
    server: {
      headers: devSecurityHeaders,
    },
    preview: {
      headers: previewSecurityHeaders,
    },
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: isElectron ? ["electron"] : [],
        output: {
          manualChunks: getManualChunk,
        },
      },
    },
    define: {
      "process.env.ELECTRON": JSON.stringify(isElectron),
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      exclude: ["e2e/**", "node_modules/**", ".claude/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/test/**",
          "src/**/*.d.ts",
          "src/**/*.stories.tsx",
          "src/main.tsx",
          "src/App.tsx",
          "e2e/**",
          // 型定義のみのポートインターフェース
          "src/application/ports/**",
          "src/domain/types/**",
          // 再エクスポートのみのバレルファイル
          "src/**/index.ts",
          // Three.js 3D コンポーネント（jsdom ではテスト不可）
          "src/presentation/components/three/**",
          // CSS アニメーションプリセット（視覚的テストのみ）
          "src/presentation/components/lineup-animation/**",
          // 静的シードデータ
          "src/infrastructure/seed/**",
          // 型定義ファイル
          "src/**/types.ts",
          "src/shared/types/PositionCategory.ts",
        ],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  };
});
