import { Injectable } from '@nestjs/common';
import postgres from 'postgres';
import appConfig from '../config/app.config';

@Injectable()
export class DatabaseService {
	private readonly pgInstance: postgres.Sql;

	constructor() {
		this.pgInstance = postgres(appConfig.DATABASE_URI, {});
	}

	get query() {
		return this.pgInstance;
	}
}
