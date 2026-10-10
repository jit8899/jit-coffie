import tseslint from "typescript-eslint";

const config = [{ ignores: [".next/**", "node_modules/**", "coverage/**"] }, ...tseslint.configs.recommended];
export default config;
