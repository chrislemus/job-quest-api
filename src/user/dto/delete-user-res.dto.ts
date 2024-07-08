import { UserEntity } from '@app/user/user.entity';

/** Delete User response data */
export class DeleteUserResDto {
  /** ID of deleted user */
  id: string;

  constructor(partial: Pick<UserEntity, 'id'>) {
    this.id = partial.id;
  }
}
