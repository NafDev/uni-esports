import { Global, Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { SmtpService } from './smtp.service';

@Global()
@Module({
	providers: [SmtpService],
	exports: [SmtpService],
	imports: [OgmaModule.forFeatures([SmtpService])]
})
export class EmailModule {}
