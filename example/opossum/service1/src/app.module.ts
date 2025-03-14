import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudyModule } from './modules/study.module';
import { RouterModule } from '@nestjs/core';
import { externalRoutes } from './routes/default.routes';

@Module({
  imports: [RouterModule.register(externalRoutes), StudyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
