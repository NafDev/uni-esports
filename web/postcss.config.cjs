const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const path = require('path')

const config = {
	plugins: [
		tailwindcss(path.join(__dirname, 'tailwind.config.cjs')),
		autoprefixer
	]
};

module.exports = config;