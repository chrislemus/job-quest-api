import { Roles } from '@app/auth/decorators';
import { RolesGuard } from '@app/auth/guards';
import { Page } from '@app/common/pagination';
import { UserEntity } from '@app/user/user.entity';
import { Get, Controller, UseGuards, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DeleteManyUsersQueryDto, FindAllUsersDto } from './dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
@ApiTags('admin')
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  /** Find all users */
  @Get()
  getAllUsers(
    @Query() findAllUsers: FindAllUsersDto,
  ): Promise<Page<UserEntity>> {
    return this.userService.findAll(findAllUsers);
  }

  // /** Delete many users by ID */
  // @Delete('delete-many')
  // // @ApiOkResponse(UserEntity)
  // remove(@Query() deleteManyUsersQueryDto: DeleteManyUsersQueryDto) {
  //   return this.userService.deleteMany(deleteManyUsersQueryDto.userIds);
  // }
}
