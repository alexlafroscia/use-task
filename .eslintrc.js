module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  env: {
    browser: true,
    es6: true
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react"
  ],
  rules: {
    // Better compatibility with TypeScript
    "no-unused-vars": "off",

    // TypeScript
    "@typescript-eslint/no-unused-vars": "error",

    // React Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  overrides: [
    {
      files: ["**/__tests__/**/*.*"],
      env: {
        jest: true
      }
    },
    {
      files: ["**/__mocks__/**/*.*"],
      env: {
        jest: true,
        node: true
      }
    }
  ]
};
