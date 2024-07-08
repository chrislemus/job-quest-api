import { Module } from '@nestjs/common';
// import { DynamoDBClientService } from './dynamo-db-client.service';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import { JobListDBService } from './job-list-db.service';
import { UserDBService } from './user-db.service';
import { JobDBService } from './job-db.service';
import { JobJobListRankDBService } from './job-job-list-rank-db.service';

@Module({
  providers: [
    // DynamoDBClientService,
    DynamoDBDocumentClientService,
    UserDBService,
    JobListDBService,
  ],
  exports: [
    JobListDBService,
    DynamoDBDocumentClientService,
    UserDBService,
    JobDBService,
    JobJobListRankDBService,
  ],
  // controllers: [UserController],
})
export class DBModule {}
