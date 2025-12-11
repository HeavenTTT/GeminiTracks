import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use type assertion to avoid TypeScript error about missing 'cwd' property on 'process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 这是一个客户端应用，我们需要在构建时将 process.env.API_KEY 替换为实际值
      // 在 Vercel 中，确保在 Environment Variables 中设置了 API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});