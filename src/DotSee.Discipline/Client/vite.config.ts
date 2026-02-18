import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "dotsee-discipline-variantshider"
    },
    outDir: "../wwwroot/App_Plugins/DotSee.Discipline.VariantsHider",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/DotSee.Discipline.VariantsHider/",
});
