import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() user: LoginDto, @Req() req: any) {
    return this.authService.login(req.user);
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // async login(@Req() req) {
  //   return this.authService.login(req.user);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req) {
    return req.user;
  }
}
