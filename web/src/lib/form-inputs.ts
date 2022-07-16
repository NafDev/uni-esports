import { atom, type WritableAtom } from 'nanostores';

interface InputHandler {
	errorText: string;
	validate: () => boolean;
}

interface InputHandlerParameters<T> {
	initialValue?: T;
	errorText: string;
	isValidOnEmptyString?: boolean;
	validator: (newValue: T) => boolean;
}

export function inputHandler<T extends string | number | boolean>(
	parameters: InputHandlerParameters<T>
): [WritableAtom<{ value: T; isValid: boolean }>, InputHandler] {
	const { initialValue = '', errorText, validator, isValidOnEmptyString = true } = parameters;

	const value = initialValue as T;
	const isValid = isValidOnEmptyString;

	const state = atom({ value, isValid });

	const validateValue = () => {
		let isValid: boolean;
		const prevState = state.get();

		if (isValidOnEmptyString && prevState.value === '') {
			isValid = true;
		}

		isValid = validator(prevState.value);
		state.set({ ...prevState, isValid });

		return isValid;
	};

	return [
		state,
		{
			errorText,
			validate: validateValue
		}
	];
}

/**
 * Helper functions for a set of input handlers
 */
export function formHandler(inputHelpers: Array<InputHandler>) {
	const validateAll = () => {
		let isValid = true;

		for (const input of inputHelpers) {
			if (!input.validate()) {
				isValid = false;
			}
		}

		return isValid;
	};

	return {
		validateAll
	};
}
