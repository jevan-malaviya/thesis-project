import { defineConfig } from 'vite'

export default defineConfig({
	root: 'src/client',
	plugins: [],
	server: { host: '0.0.0.0', port: 8000 },
	clearScreen: false,
})
