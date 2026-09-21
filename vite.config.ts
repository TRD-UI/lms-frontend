import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // loadEnv merges the host's process.env with any .env files, which is how
  // Vercel/Netlify-style variables arrive.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // Vite inlines these at build time, so a build without them produces a
  // bundle that can never work. Better a red deploy than a white page.
  if (command === "build" && (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY)) {
    throw new Error(
      "Build aborted: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set.\n" +
      "Set them in this environment (locally: .env.local; on a host: its environment " +
      "variables for the environment being built) and build again."
    );
  }

  return {
  server: {
    host: "::",
    port: 5000,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
