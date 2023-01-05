import { Global, Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { DatabaseService } from './db.service';

@Global()
@Module({
	imports: [OgmaModule.forFeatures([DatabaseService])],
	providers: [DatabaseService],
	exports: [DatabaseService]
})
export class DatabaseModule {}
