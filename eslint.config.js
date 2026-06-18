import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default [
    {
        ignores: ["dist"]
    },

    js.configs.recommended,

    {
        files: ["**/*.{js,jsx}"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",

            globals: {
                ...globals.browser
            },

            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },

        settings: {
            react: { version: "detect" }
        },

        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh
        },

        rules: {
            ...react.configs.flat.recommended.rules,
            ...reactHooks.configs.recommended.rules,

            // Using the modern JSX transform — no need to import React in scope.
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            // Props validation via PropTypes is out of scope for this app.
            "react/prop-types": "off",

            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true }
            ]
        }
    },

    prettier
];