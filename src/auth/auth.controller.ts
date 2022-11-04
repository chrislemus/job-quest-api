import { CreateUserDto } from '@app/users/dto';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import { UserLoginReqDto } from './dto';
import { LocalAuthGuard } from './guards';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _user: UserLoginReqDto, @Req() req: any) {
    return this.authService.createJwt(req.user);
  }

  @SkipAuth()
  @Post('signup')
  signup(@Body() user: CreateUserDto) {
    return this.authService.signup(user);
  }

  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req) {
    return req.user;
  }
}
