import { GetAuthUser } from '@app/common/decorators';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserProfile } from './dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private usersService: UserService) {}

  @Get('profile')
  getProfile(@GetAuthUser('id') userId: number): Promise<UserProfile> {
    return this.usersService.userProfile(userId);
  }
}
