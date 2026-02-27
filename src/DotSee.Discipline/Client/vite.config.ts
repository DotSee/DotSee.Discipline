import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "dotsee-discipline"
    },
    outDir: "../wwwroot/App_Plugins/DotSee.Discipline",
    emptyOutDir: true,
    copyPublicDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/DotSee.Discipline/",
});
