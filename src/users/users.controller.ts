import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { UsersService } from './users.service';

@ApiBearerAuth()
@Controller('users')
@ApiTags('users')
export class UsersController {
  // constructor(private usersService: UsersService) {}
}
