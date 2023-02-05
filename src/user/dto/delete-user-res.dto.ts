import { UserEntity } from '@app/user/user.entity';
import { IsNumber } from 'class-validator';

/** Delete User response data */
export class DeleteUserResDto {
  /** ID of deleted user */
  @IsNumber()
  id: number;

  constructor(partial: Pick<UserEntity, 'id'>) {
    Object.assign(this, partial);
  }
}
