// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    ignorePatterns: ['template-**', '*-template'],
    plugins: ['import'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021,
    },
    reportUnusedDisableDirectives: true,
})