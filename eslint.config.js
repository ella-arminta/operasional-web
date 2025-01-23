import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginVue from "eslint-plugin-vue";
import prettierConfig from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended, // JavaScript recommended rules
  tseslint.configs.recommended, // TypeScript recommended rules
  pluginVue.configs["flat/essential"], // Vue recommended rules (essential level)
  {
    files: ["**/*.vue"],
    rules: {
      "vue/indent": ["error", 2],
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
    },
  },
  {
    // Enable Prettier as part of linting
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": "error", // Treat Prettier issues as errors
    },
  },
  prettierConfig, // Disable ESLint rules that conflict with Prettier
];
