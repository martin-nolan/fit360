import nextPlugin from "eslint-config-next";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
    ],
  },
  {
    ...nextPlugin,
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // You can add your own strict rules here
    rules: {
      ...nextPlugin.rules,
      // Example of a stricter rule:
      "no-console": "warn",
    },
  },
];

export default config;
