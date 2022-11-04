import { SkipAuth } from '@app/auth/decorators';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiBearerAuth()
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  me() {
    return 'hi';
  }

  @Get()
  @SkipAuth()
  getAllUsers() {
    return this.usersService.findMany();
  }
}
