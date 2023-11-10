import { Test, TestingModule } from '@nestjs/testing';
import { JobLogService } from './job-log.service';
import { JobLogModule } from './job-log.module';

describe('JobLogService', () => {
  let service: JobLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JobLogModule],
    }).compile();

    service = module.get<JobLogService>(JobLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
