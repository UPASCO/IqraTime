// ESLint flat config for IQRAnow (Expo + TypeScript).
// See https://docs.expo.dev/guides/using-eslint/
const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: [
      "dist/*",
      "node_modules/*",
      ".expo/*",
      "coverage/*",
      // One-off asset-generation helper (see README/THIRD_PARTY_LICENSES.md):
      // requires `sharp`, which is intentionally installed on-demand
      // (`npm install --no-save sharp`) and not a project dependency.
      "scripts/generateIconAssets.mjs",
    ],
  },
  {
    rules: {
      "import/order": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // CLI tools: stdout output via console.log is the intended product, not debug noise.
    files: ["scripts/**/*.ts", "scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
    },
  },
];
