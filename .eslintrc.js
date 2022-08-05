// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    amd: true
  },
  extends: ['eslint:recommended', 'plugin:vue/essential'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    // 要求开发环境中允许使用 debugger
    'no-debugger': 'off',

    'no-console': 'off',

    // 要求尽可能地使用单引号
    quotes: ['error', 'single'],

    //结尾不添加分号
    semi: [2, 'never'],

    'semi-spacing': 0,

    // 要求缩进采用2个空格
    indent: ['error', 2],

    // 要求缩进采用2个空格
    'vue/html-indent': ['error', 2],

    // 可以不强制使用自闭合标签
    'vue/html-self-closing': 'off',

    'vue/no-parsing-error': [
      2,
      {
        'x-invalid-end-tag': false
      }
    ],

    'vue/no-side-effects-in-computed-properties': 'off',
    'vue/max-attributes-per-line': 0,
    'vue/html-indent': 0,
    indent: 0,
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-closing-bracket-spacing': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/attribute-hyphenation': 'off'
  }
}
