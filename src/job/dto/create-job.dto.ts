import { Job } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateJobDto implements Omit<Job, 'id'> {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  company: string;
  @IsString()
  location: string | null;
  @IsString()
  @IsUrl()
  url: string | null;
  @IsString()
  salary: string | null;
  @IsString()
  description: string | null;
  @IsString()
  color: string | null;
  @IsNumber()
  @IsNotEmpty()
  jobListId: number;
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
