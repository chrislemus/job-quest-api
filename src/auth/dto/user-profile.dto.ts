import { Exclude } from 'class-transformer';

/** User login request DTO */
export class UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  @Exclude()
  password: string;
  @Exclude()
  refreshToken?: string;
  @Exclude()
  createdAt?: Date;

  constructor(partial: Partial<UserProfile>) {
    Object.assign(this, partial);
  }
}
