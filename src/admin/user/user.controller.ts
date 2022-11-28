import { Roles } from '@app/auth/decorators';
import { RolesGuard } from '@app/auth/guards';
import { Get, Controller, UseGuards, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DeleteManyUsersQueryDto } from './dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
@ApiTags('admin')
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAllUsers() {
    return 'this.userService.userProfile(userId);';
  }

  /** Delete many users by ID */
  @Delete('delete-many')
  // @ApiOkResponse(UserEntity)
  remove(@Query() deleteManyUsersQueryDto: DeleteManyUsersQueryDto) {
    return this.userService.deleteMany(deleteManyUsersQueryDto.userIds);
  }
}
