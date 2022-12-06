import { ArgumentMetadata, Injectable, ParseIntPipe } from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe extends ParseIntPipe {
	async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
		const transformedValue = await super.transform(value, metadata);

		if (transformedValue < 1) {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw this.exceptionFactory('Validation failed (positive numeric string is expected)');
		}

		return transformedValue;
	}
}
