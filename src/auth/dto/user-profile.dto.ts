import { Exclude } from 'class-transformer';

/** User login request DTO */
export class UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  @Exclude()
  password: string;
  @Exclude()
  refreshToken?: string;
  @Exclude()
  createdAt?: Date;
  role: string;

  constructor(partial: Partial<UserProfile>) {
    Object.assign(this, partial);
  }
}
