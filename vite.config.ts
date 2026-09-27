import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  // For https://USERNAME.github.io/REPOSITORY/, use '/REPOSITORY/'.
  // For a custom domain or USERNAME.github.io repository, use '/'.
  base: '/followcheck/',
  plugins: [react(), tailwindcss(), {
    name: 'development-csp',
    apply: 'serve',
    // Vite needs its development-only inline preamble and HMR WebSocket.
    transformIndexHtml: (html) => html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, ''),
  }],
});
