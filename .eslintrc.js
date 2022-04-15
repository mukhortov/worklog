module.exports = {
  // extends: 'erb',
  extends: ['erb', 'plugin:prettier/recommended'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 0,
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 0,
    // 'prettier/prettier': 'off',
    // Disable airbnb config rules
    'import/prefer-default-export': 0,
    'import/order': 0,
    'react/require-default-props': 0,
    'react/jsx-props-no-spreading': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/alt-text': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'promise/catch-or-return': 0,
    'promise/always-return': 0,
    'promise/no-nesting': 0,
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-throw-literal': 0,
    'global-require': 0,
    'no-console': 0,
    'no-nested-ternary': 0,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
}
