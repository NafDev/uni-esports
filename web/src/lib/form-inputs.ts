import { atom, type WritableAtom } from 'nanostores';

interface InputHandler {
	errorText: string;
	validate: (submit?: boolean) => boolean;
}

interface InputHandlerParameters<T> {
	initialValue?: T;
	errorText?: string;
	validator?: (newValue: T) => boolean;
}

export function inputHandler<T extends string | number | boolean | Date>(
	parameters: InputHandlerParameters<T> = {}
): [WritableAtom<{ value: T; isValid: boolean }>, InputHandler] {
	const { initialValue = '', errorText = '', validator = () => true } = parameters;

	const value = initialValue as T;

	const state = atom({ value, isValid: true });

	const validateValue = (submit = true) => {
		let isValid: boolean;
		const prevState = state.get();

		if (prevState.value === '' && submit === false) {
			isValid = true;
		} else {
			isValid = validator(prevState.value);
		}

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
			if (!input.validate(true)) {
				isValid = false;
			}
		}

		return isValid;
	};

	return {
		validateAll
	};
}
