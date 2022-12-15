const config = require('../.xo-config.js')

module.exports = {
	...config,
	rules: {
		'import/extensions': 'off',
		'new-cap': [
			'error',
			{
				capIsNewExceptionPattern: '^@*'
			}
		],
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/naming-convention': 'off'
	}
};
