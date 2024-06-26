import react from "@vitejs/plugin-react";
import path from "path";
import { UserConfig, mergeConfig } from "vite";
import baseConfig from "../../vite.config";

process.env.VITE_ENVIRONMENT = "tauri";

export default mergeConfig(baseConfig(), {
	plugins: [react()],

	build: {
		rollupOptions: {
			output: {
				sourcemapBaseUrl: "https://dev.gram.ax",
			},
			input: {
				index: path.resolve(__dirname, "index.html"),
				settings: path.resolve(__dirname, "settings.html"),
			},
		},
	},

	publicDir: "../../core/public",
	envDir: "../..",
} as UserConfig);
