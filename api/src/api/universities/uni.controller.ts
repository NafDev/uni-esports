import { Controller, Get } from '@nestjs/common';
import { UniversityService } from './uni.service';

@Controller('universities')
export class UniversityController {
	constructor(private readonly uniService: UniversityService) {}

	@Get('list')
	async getUniversityList() {
		return this.uniService.getUniversities();
	}
}
