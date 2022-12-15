const config = require('../.prettierrc.js');

module.exports = {
	...config,
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
