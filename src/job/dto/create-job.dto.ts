import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { JobEntity } from '../entities';

export class CreateJobDto implements Omit<JobEntity, 'id' | 'userId'> {
  /**
   * Job Title
   * @example 'Software Engineer'
   */
  @IsString()
  @IsNotEmpty()
  title: string;
  /**
   * Job company
   * @example Acme
   */
  @IsString()
  @IsNotEmpty()
  company: string;
  /**
   * Job Location
   * @example 'Raleigh, NC'
   */
  @IsOptional()
  @IsString()
  location: string | null;
  /**
   * Job post URL
   */
  @IsString()
  @IsOptional()
  url: string | null;
  /**
   * Job salary
   * @example 56k
   */
  @IsOptional()
  @IsString()
  salary: string | null;
  /**
   * Job description
   */
  @IsOptional()
  @IsString()
  description: string | null;
  /**
   * Hexadecimal color to be used in UI when displaying job content
   * @example #ffff
   */
  @IsOptional()
  @IsString()
  color: string | null;
  /**
   * Job List ID belonging to this Job
   */
  @IsNumber()
  @IsNotEmpty()
  jobListId: number;
}
