const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');

module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			white: '#fff',
			black: '#000',
			transparent: '#fff0',
			grey: {
				700: '#ADB1B8',
				950: '#F0F4F5'
			},
			gold: '#d4af37',
			primary: '#3372DF',
			secondary: '#435A8A',
			success: '#30b663',
			warning: '#D37037',
			danger: '#B93434',
			blue: {
				100: '#131E2B',
				200: '#1A263D',
				300: '#283653',
				400: '#293549',
				500: '#2A364B'
			},
			// 'bg-stop-1': '#283653',
			// 'bg-stop-2': '#131e2b',
			// 'bg-stop-3': '#1a263d',

			game: {
				csgo: '#de9b35',
				league: '#445fa5',
				valorant: '#dc3d4b',
				overwatch: '#f99e1a',
				siege: '#576367',
				rcktlg: '#0C88FC'
			}
		},
		extend: {}
	},
	plugins: [forms({ strategy: 'class' }), typography],
	mode: 'jit'
};
