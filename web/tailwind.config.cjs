const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');

module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			white: '#fff',
			black: '#000',
			greyText: '#c9d4e9',
			transparent: '#fff0',
			primary: '#3984da',
			secondary: '#555d81',
			success: '#30b663',
			warning: '#E29A11',
			danger: '#D44448',
			background: '#001D3D'
		},
		extend: {}
	},
	plugins: [forms({ strategy: 'class' }), typography],
	mode: 'jit'
};
