import { AuthUser } from 'src/auth/dto';
import { GetAuthUser } from 'src/common/decorators';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteUserResDto } from './dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  /** Get user profile */
  @Get('profile')
  getProfile(@GetAuthUser() authUser: AuthUser): Promise<UserEntity> {
    return this.userService.userProfile(authUser);
  }

  /** Delete user */
  @Delete(':id')
  delete(
    @Param('id') userId: string,
    @GetAuthUser() authUser: AuthUser,
  ): Promise<DeleteUserResDto> {
    if (authUser.role === 'ADMIN') {
      return this.userService.delete(authUser);
    } else if (authUser.id === userId) {
      return this.userService.delete(authUser);
    }
    throw new NotFoundException();
  }
}
