import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// 👇 Tạo lại __dirname vì trong ESM không có sẵn
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 👈 alias @ trỏ vào thư mục src
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ["xlsx"], // 👈 THÊM DÒNG NÀY
  },
});
