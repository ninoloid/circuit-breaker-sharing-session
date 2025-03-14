import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/data')
  getData() {
    return {
      code: 200,
      message: 'Data from service 3',
      data: {
        id: 1,
        title: 'Data',
      },
    };
  }
}
