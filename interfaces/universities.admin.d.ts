import type { IUniversity } from "./universities";

export interface IUniversityAdminView {
	domains: string[];
}

export interface IUniversityDomainDto {
	domain: string;
}

export interface IUniversityNameDto {
	name: string;
}
