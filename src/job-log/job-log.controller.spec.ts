import { Test, TestingModule } from '@nestjs/testing';
import { JobLogController } from './job-log.controller';
import { JobLogService } from './job-log.service';

describe('JobLogController', () => {
  let controller: JobLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobLogController],
      providers: [JobLogService],
    }).compile();

    controller = module.get<JobLogController>(JobLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
