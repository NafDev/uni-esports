const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');

module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			white: '#fff',
			black: '#000',
			transparent: '#fff0',
			grey: '#8492a6',
			primary: '#3c94ff',
			danger: '##F05365',
			background: '#001D3D'
		},
		extend: {}
	},
	plugins: [forms, typography],
	mode: 'jit'
};
