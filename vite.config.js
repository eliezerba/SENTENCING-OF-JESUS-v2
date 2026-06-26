import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
    plugins: [react(), viteSingleFile()],
    base: './',
    build: {
        // Single-file output: all JS + CSS inlined → works from file://
        // The chunkSizeWarningLimit is raised because the CSV data is embedded.
        chunkSizeWarningLimit: 8000,
    },
});
