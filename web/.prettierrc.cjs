module.exports = {
	singleQuote: true,
	useTabs: true,
	trailingComma: 'none',
	printWidth: 100,
	plugins: [require('prettier-plugin-tailwindcss')],
	tailwindConfig: './tailwind.config.cjs',
	overrides: [
		{
			files: '*.svelte',
			options: { parser: 'svelte' }
		}
	]
};
