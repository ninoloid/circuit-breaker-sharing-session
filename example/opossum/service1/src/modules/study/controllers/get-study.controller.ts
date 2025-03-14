import { Controller, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { GetStudyService } from '../services/get-study.service';

@Controller()
export class GetStudyController {
  constructor(private readonly getStudyService: GetStudyService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getStudy(): Promise<any> {
    return await this.getStudyService.getStudy();
  }
}
