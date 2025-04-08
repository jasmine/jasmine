import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([{
  extends: compat.extends("plugin:compat/recommended"),

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },

    ecmaVersion: 2018,
    sourceType: "commonjs",
  },

  rules: {
    curly: "error",

    quotes: ["error", "single", {
      avoidEscape: true,
    }],

    "no-unused-vars": ["error", {
      args: "none",
    }],

    "no-implicit-globals": "error",
    "block-spacing": "error",
    "func-call-spacing": ["error", "never"],
    "key-spacing": "error",
    "no-tabs": "error",
    "no-trailing-spaces": "error",
    "no-whitespace-before-property": "error",
    semi: ["error", "always"],
    "space-before-blocks": "error",
    "no-eval": "error",
    "no-var": "error",
    "no-debugger": "error",
    "no-console": "error",
  },
}]);
