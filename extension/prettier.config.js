/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  bracketSpacing: true,
  useTabs: true,
  alowParens: 'always',
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config