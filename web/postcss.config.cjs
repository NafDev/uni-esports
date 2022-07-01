const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const postcssimport = require('postcss-import');
const path = require('path');

const config = {
	plugins: [tailwindcss(path.join(__dirname, 'tailwind.config.cjs')), autoprefixer, postcssimport]
};

module.exports = config;
