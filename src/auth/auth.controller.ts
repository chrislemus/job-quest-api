import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import { LoginDto } from './dto';
import { LocalAuthGuard } from './guards';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() user: LoginDto, @Req() req: any) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req) {
    return req.user;
  }
}
