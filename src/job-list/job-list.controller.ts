import { JobListEntity } from './entities/job-list.entity';
import { ApiPageResponse, Page, PaginatedQuery } from 'src/common/pagination';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiResponseOptions,
  ApiTags,
} from '@nestjs/swagger';
import { CreateJobListDto, UpdateJobListDto } from './dto';
import { JobListService } from './job-list.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  GetAuthUser,
} from 'src/common/decorators';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  Type,
  applyDecorators,
  UsePipes,
  UseInterceptors,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ApiOkResponse as _ApiOkResponse,
  ApiQuery as _ApiQuery,
  ApiResponse as _ApiResponse,
} from '@nestjs/swagger';
import { z, ZodObject, ZodRawShape, ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'query') {
      const parsedValue = this.schema.safeParse(value);
      if (!parsedValue.success) {
        const { fieldErrors } = parsedValue.error.flatten();
        const errMessages = Object.entries(fieldErrors).map((KV) =>
          KV.join(': '),
        );
        throw new BadRequestException(errMessages);
      }
      return parsedValue.data;
    }
    return value;
  }
}

const ApiResponse = <TModel extends ZodSchema>(
  schema: TModel,
  options: Omit<ApiResponseOptions, 'schema' | 'status'> &
    NonNullable<Pick<ApiResponseOptions, 'status'>>,
) => {
  const { $schema, description, ...jsonSchema } = zodToJsonSchema(schema);

  if (!description) throw new Error('Description is required');
  jsonSchema.title = description;
  // const SchemaRes = () => SetMetadata(`SchemaRes${options.status}`, schema);

  return _ApiResponse({ schema: jsonSchema as SchemaObject, ...options });
  // return applyDecorators(
  //   _ApiResponse({ schema: jsonSchema as SchemaObject, ...options }),
  //   SchemaRes(),
  // );
};

const apiSchema = <A extends string, T extends ZodSchema>(s: A, type: T) => {
  return { [s]: type.describe(s) } as { [K in A]: T };
};

const { jobListSchema } = apiSchema(
  'jobListSchema',
  z
    .object({
      id: z.string().min(15),
      label: z.string().min(1),
      userId: z.string().min(15),
      order: z.number(),
    })
    .strict(),
);

const { PaginatedQuery2 } = apiSchema(
  'PaginatedQuery2',
  z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(20).default(10),
      pageTotalCount: z.coerce.boolean().default(false),
    })
    .strip(),
);
type PaginatedQuery2 = z.infer<typeof PaginatedQuery2>;

const ApiQuery = <T extends ZodSchema>(mainSchema: T) => {
  const jsonSchema = zodToJsonSchema(mainSchema) as SchemaObject;
  const properties = jsonSchema.properties;
  if (!properties) {
    throw new Error('Schema properties not found');
  }
  const decorators = Object.keys(properties).map((key) => {
    const schema = properties[key];
    const required = !!jsonSchema.required?.includes(key);
    const propDef = { name: key, schema: schema, required };
    return _ApiQuery(propDef);
  });

  return applyDecorators(
    ...decorators,
    UsePipes(new ZodValidationPipe(mainSchema)),
  );
};

// console.log(PaginatedQuery2);

@Controller('job-list')
@ApiTags('job-list')
@ApiBearerAuth()
export class JobListController {
  constructor(private readonly jobListService: JobListService) {}

  /** Create a new Job List */
  @Post()
  @ApiCreatedResponse(JobListEntity)
  create(
    @Body() createJobListDto: CreateJobListDto,
    @GetAuthUser('id') userId: string,
  ): Promise<JobListEntity> {
    return this.jobListService.create(createJobListDto, userId);
  }

  /** Get all Job Lists */
  @Get()
  @ApiResponse(jobListSchema, { status: 200 })
  @ApiQuery(PaginatedQuery2)
  findAll(
    @Query() query: PaginatedQuery2,
    @GetAuthUser('id') userId: string,
  ): Promise<Page<JobListEntity>> {
    return this.jobListService.findAll(query, userId);
  }

  /** Get Job List by ID */
  @Get(':id')
  @ApiNotFoundResponse()
  async findOne(
    @Param('id') id: string,
    @GetAuthUser('id') userId: string,
  ): Promise<JobListEntity> {
    const jobList = await this.jobListService.findOne(id, userId);
    return jobList;
  }

  /** Update a Job List */
  @Patch(':id')
  @ApiNotFoundResponse()
  async updateJobList(
    @Param('id') jobListId: string,
    @GetAuthUser('id') userId: string,
    @Body() jobListDto: UpdateJobListDto,
  ): Promise<JobListEntity> {
    const jobList = await this.jobListService.updateJobList(
      jobListId,
      jobListDto,
      userId,
    );

    return jobList;
  }

  /** Delete a Job List */
  @Delete(':id')
  @ApiOkResponse(JobListEntity)
  @ApiNotFoundResponse()
  async remove(
    @Param('id') jobListId: string,
    @GetAuthUser('id') userId: string,
  ): Promise<string> {
    const deletedJobList = await this.jobListService.remove(jobListId, userId);
    return deletedJobList;
  }
}
