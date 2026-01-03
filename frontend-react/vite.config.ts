import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000,
        minify: 'esbuild',
        target: 'es2015',
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    animation: ['framer-motion'],
                    lottie: ['@lottiefiles/dotlottie-react'],
                    icons: ['lucide-react'],
                    socket: ['socket.io-client'],
                },
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom'],
    },
})
