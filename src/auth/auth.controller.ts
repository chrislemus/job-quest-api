import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  // @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    // return req.user;
    return this.authService.login(req.user);
  }
}
