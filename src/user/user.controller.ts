import { AuthUser } from '@app/auth/dto';
import { GetAuthUser } from '@app/common/decorators';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
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
  getProfile(@GetAuthUser('id') userId: number): Promise<UserEntity> {
    return this.userService.userProfile(userId);
  }

  /** Delete user */
  @Delete(':id')
  delete(
    @Param('id') userId: number,
    @GetAuthUser() authUser: AuthUser,
  ): Promise<DeleteUserResDto> {
    if (authUser.role === Role.ADMIN) {
      return this.userService.delete(userId);
    } else if (authUser.id === userId) {
      return this.userService.delete(userId);
    }
    throw new NotFoundException();
  }
}
