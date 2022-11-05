import { AuthUser, AuthUserId } from '@app/common/decorators';
import { CreateUserDto } from '@app/users/dto';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import { UserLoginReqDto } from './dto';
import { JwtRefreshAuthGuard, LocalAuthGuard } from './guards';
import { AuthTokens } from './types';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _user: UserLoginReqDto, @Req() req: any): Promise<AuthTokens> {
    return this.authService.localLogin(req.user);
  }

  @SkipAuth()
  @Post('signup')
  signup(@Body() user: CreateUserDto) {
    return this.authService.signup(user);
  }

  @SkipAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-jwt')
  refreshTokens(
    @AuthUserId() userId: number,
    @AuthUser('refreshToken') refreshToken: string,
  ): Promise<AuthTokens> {
    return this.authService.refreshJwt(userId, refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req) {
    return req.user;
  }
}
