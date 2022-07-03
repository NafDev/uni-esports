import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import startCase from 'lodash.startcase';
import capitalize from 'lodash.capitalize';
import { ConflictException } from '@nestjs/common';

export const enum PrismaError {
	UNKNOWN,
	INVALID_REQUEST,
	NOT_FOUND,
	CONSTRAINT_FAILED
}

export function classifyPrismaError(error: unknown): [PrismaError, PrismaClientKnownRequestError] {
	let errorCode = '';
	let prismaError: PrismaClientKnownRequestError;

	if (error instanceof PrismaClientKnownRequestError) {
		errorCode = error.code;
		prismaError = error;
	} else {
		const originalError = error as Error;
		throw new Error('Unexpected error type', { cause: originalError });
	}

	// https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
	switch (errorCode.toString()) {
		case 'P2000':
		case 'P2005':
		case 'P2006':
		case 'P2011':
		case 'P2012':
		case 'P2013':
		case 'P2014':
		case 'P2019':
			return [PrismaError.INVALID_REQUEST, prismaError];
		case 'P2001':
		case 'P2015':
		case 'P2018':
		case 'P2025':
			return [PrismaError.NOT_FOUND, prismaError];
		case 'P2002':
		case 'P2003':
		case 'P2004':
			return [PrismaError.CONSTRAINT_FAILED, prismaError];
		default:
			return [PrismaError.UNKNOWN, prismaError];
	}
}

export function normalizeConflictError(error: PrismaClientKnownRequestError): string | undefined {
	if (error.meta?.target instanceof Array) {
		const conflictFields: string[] = error.meta.target.map((value: string) => /\((.+)\)/.exec(value)?.at(0) ?? value);

		const errorPrefix = capitalize(startCase(conflictFields.join(', ')));
		return `${errorPrefix} already in use`;
	}
}
