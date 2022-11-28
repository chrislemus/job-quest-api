import { Roles } from '@app/auth/decorators';
import { RolesGuard } from '@app/auth/guards';
import { Page } from '@app/common/pagination';
import { UserEntity } from '@app/user/user.entity';
import {
  Get,
  Controller,
  UseGuards,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DeleteUserResDto, FindAllUsersDto } from './dto';
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

  /** Delete a user */
  @Delete(':id')
  delete(@Param('id') userId: number): Promise<DeleteUserResDto> {
    return this.userService.delete(userId);
  }
}
