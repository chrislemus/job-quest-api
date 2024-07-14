import { Module } from '@nestjs/common';
// import { DynamoDBClientService } from './dynamo-db-client.service';
import { DynamoDBDocumentClientService } from './dynamo-db-document-client.service';
import { JobListDBService } from './job-list-db.service';
import { UserDBService } from './user-db.service';
import { JobDBService } from './job-db.service';
import { JobJobListRankDBService } from './job-job-list-rank-db.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],

  providers: [
    // DynamoDBClientService,
    DynamoDBDocumentClientService,
    UserDBService,
    JobListDBService,
    JobDBService,
    JobJobListRankDBService,
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
