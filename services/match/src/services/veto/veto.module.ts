import { Module } from '@nestjs/common';
import { VetoController } from './veto.controller';
import { VetoService } from './veto.service';

@Module({
	controllers: [VetoController],
	providers: [VetoService]
})
export class VetoModule {}
