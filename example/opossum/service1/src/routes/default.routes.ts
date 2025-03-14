import { StudyModule } from 'src/modules/study.module';

export const externalRoutes = [
  {
    path: '/',
    children: [
      {
        path: '/studies',
        module: StudyModule,
      },
    ],
  },
];
