import { Test, TestingModule } from '@nestjs/testing';
import { JobListController } from './job-list.controller';
import { JobListService } from './job-list.service';

describe('JobListController', () => {
  let controller: JobListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobListController],
      providers: [JobListService],
    }).compile();

    controller = module.get<JobListController>(JobListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
