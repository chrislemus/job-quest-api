import { Page, pageQuery, PaginatedQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateJobListDto, UpdateJobListDto } from './dto';
import { JobListEntity } from './entities/job-list.entity';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { JobListDBService } from '@app/db/job-list-db.service';

// const client = new DynamoDBClient({});
// const dynamo = DynamoDBDocumentClient.from(client);

// const tableName = 'JobQuest-JobList';
// export type IQueryCommandOutput<T> = Omit<QueryCommandOutput, 'Items'> & {
//   Items?: T[];
// };

// // console.log(process.env);

// const addItemsCommand = new BatchWriteCommand({
//   RequestItems: {
//     [tableName]: [
//       {
//         PutRequest: {
//           Item: {
//             id: '1',
//             userId: '1',
//             order: 1,
//             label: 'Queue',
//           },
//         },
//       },
//       {
//         PutRequest: {
//           Item: {
//             id: '2',
//             userId: '1',
//             order: 2,
//             label: 'Applied',
//           },
//         },
//       },
//       {
//         PutRequest: {
//           Item: {
//             id: '3',
//             userId: '1',
//             order: 3,
//             label: 'Interview',
//           },
//         },
//       },
//       {
//         PutRequest: {
//           Item: {
//             id: '4',
//             userId: '1',
//             order: 4,
//             label: 'Offer',
//           },
//         },
//       },
//       {
//         PutRequest: {
//           Item: {
//             id: '5',
//             userId: '1',
//             order: 5,
//             label: 'Rejected',
//           },
//         },
//       },
//     ],
//   },
// });

// dynamo.send(command).then(console.log).catch(console.error);

@Injectable()
export class JobListService {
  constructor(
    // private prisma: PrismaService,
    private configService: ConfigService,
    private jobListDB: JobListDBService,
  ) {}

  async test(userId: number) {
    // console.log(dynamo);
    try {
      // const command = new QueryCommand({
      //   TableName: tableName,
      //   ExpressionAttributeValues: { ':userId': userId.toString() },
      //   KeyConditionExpression: 'userId = :userId',
      // });

      // return dynamo.send(addItemsCommand);
      // const body = (await dynamo.send(command)) as IQueryCommandOutput<{
      //   id: string;
      //   userId: string;
      // }>;
      const body = await this.jobListDB.query({
        ExpressionAttributeValues: { ':userId': userId.toString() },
        KeyConditionExpression: 'userId = :userId',
      });

      const data = body.Items?.map(({ id, userId, ...item }) => ({
        id: +id,
        userId: +userId,
        ...item,
      }));

      if (!data) {
        throw new NotFoundException('No data found');
      }

      return {
        data,
        pageInfo: {
          currentPage: 1,
          currentPageSize: 20,
          currentPageCount: 5,
        },
      };

      // return body;
    } catch (error) {
      // console.log(error);
      throw new InternalServerErrorException(
        'Failed to fetch data from DynamoDB',
      );
    }
    // body = body.Item;
  }

  /** Create a Job List */
  async create(
    createJobListDto: CreateJobListDto,
    userId: string,
  ): Promise<JobListEntity> {
    const createLimit = this.configService.get<number>('JOB_LIST_CREATE_LIMIT');
    // const userJobListCount = await this.prisma.jobList.count({
    //   where: { userId },
    // });
    // const userJobListCount = await this.prisma.jobList.count({
    //   where: { userId },
    // });
    const body = await this.jobListDB.query({
      ExpressionAttributeValues: { ':userId': userId.toString() },
      KeyConditionExpression: 'userId = :userId',
    });
    const data = body.Items;

    if (!data) throw new InternalServerErrorException();

    if (createLimit && data.length >= createLimit) {
      throw new ConflictException(
        `Exceeded Job List limit (${createLimit}). Consider deleting Job Lists to free up some space.`,
      );
    }

    const lastJobList = data.sort((a, b) => b.order - a.order)[0];
    // console.log(lastJobList);
    const nextOrderNumber = (lastJobList?.order || 0) + 1;

    // const jobList = await this.prisma.jobList.create({
    //   data: {
    //     label: createJobListDto.label,
    //     order: nextOrderNumber,
    //     userId,
    //   },
    // });
    const { Item: jobList } = await this.jobListDB.create({
      label: createJobListDto.label,
      order: nextOrderNumber,
      userId,
    });

    if (!jobList) throw new InternalServerErrorException();
    return jobList;
  }

  /** Find all Job Lists that belongs to a user */
  async findAll(
    query: PaginatedQuery,
    userId: number,
  ): Promise<Page<JobListEntity>> {
    // const command = new QueryCommand({
    //   TableName: tableName,
    //   ExpressionAttributeValues: { ':userId': userId.toString() },
    //   KeyConditionExpression: 'userId = :userId',
    // });

    // return dynamo.send(addItemsCommand);
    // const body = (await dynamo.send(command)) as IQueryCommandOutput<{
    //   id: string;
    //   userId: string;
    // }>;
    const body = await this.jobListDB.query({
      ExpressionAttributeValues: { ':userId': userId.toString() },
      KeyConditionExpression: 'userId = :userId',
    });

    const data = body.Items;

    if (!data) {
      throw new NotFoundException('No data found');
    }

    return {
      data,
      pageInfo: {
        currentPage: 0,
        currentPageSize: 0,
        currentPageCount: 0,
      },
    };

    // return body;

    // bod
    // return pageQuery({
    //   pageConfig: query,
    //   queryFn: this.prisma.jobList.findMany,
    //   queryArgs: { where: { userId } },
    //   countFn: this.prisma.jobList.count,
    // });
  }

  async findOne(id: string, userId: string): Promise<JobListEntity> {
    // const jobList = await this.prisma.jobList.findUnique({ where: { id: id } });
    const { Item: jobList } = await this.jobListDB.queryUnique(userId, id);
    // if (jobList?.userId !== userId) throw new NotFoundException();
    if (!jobList) throw new NotFoundException();
    return jobList;
  }

  /** Update a Job List */
  async updateJobList(
    jobListId: string,
    jobListDto: UpdateJobListDto,
    userId: string,
  ): Promise<JobListEntity> {
    // const jobList = await this.prisma.jobList.findUnique({
    //   where: { id: jobListId },
    // });
    // const { Item: jobList } = await this.jobListDB.queryUnique(
    //   userId,
    //   jobListId,
    // );

    // if (!jobList) throw new NotFoundException();

    const { Attributes: updatedJobList } = await this.jobListDB.update({
      id: jobListId,
      userId,
      label: jobListDto.label,
    });

    if (!updatedJobList) throw new NotFoundException();

    return updatedJobList;
  }

  /** Remove a Job List */
  async remove(jobListId: string, userId: string): Promise<string> {
    // const jobList = await this.prisma.jobList.findUnique({
    //   where: { id: jobListId },
    //   select: { userId: true },
    // });
    await this.jobListDB.delete(userId, jobListId);

    // if (jobList?.userId !== userId) throw new NotFoundException();

    // const res = await this.prisma.jobList.delete({ where: { id: jobListId } });
    return jobListId;
  }
}
