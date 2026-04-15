module.exports = {
  env: { browser: true, es2021: true },
  extends: ['airbnb', 'airbnb/hooks'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
