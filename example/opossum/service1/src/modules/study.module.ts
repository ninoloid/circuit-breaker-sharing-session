import { Module } from '@nestjs/common';
import { GetStudyController } from './study/controllers/get-study.controller';
import { GetStudyService } from './study/services/get-study.service';
import { CircuitBreakerGenerator } from '../common/libs/services/circuitBreakerGenerator.service';

@Module({
  imports: [],
  controllers: [GetStudyController],
  providers: [CircuitBreakerGenerator, GetStudyService],
})
export class StudyModule {}
