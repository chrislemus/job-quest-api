import { GetAuthUser } from '@app/common/decorators';
import { CreateUserDto } from '@app/users/dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import { AuthTokens, AuthUser, UserLoginReqDto } from './dto';
import { JwtRefreshAuthGuard, LocalAuthGuard } from './guards';
import { AuthUserWithRefreshToken } from './types';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * User Log In
   */
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: UserLoginReqDto })
  login(@GetAuthUser() user: AuthUser): Promise<AuthTokens> {
    return this.authService.localLogin(user.id, user.email);
  }

  @SkipAuth()
  @Post('signup')
  signup(@Body() user: CreateUserDto): Promise<AuthTokens> {
    return this.authService.signup(user);
  }

  @SkipAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refreshTokens(
    @GetAuthUser() user: AuthUserWithRefreshToken,
  ): Promise<AuthTokens> {
    return this.authService.refreshJwt(user.id, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetAuthUser('id') id: number): Promise<boolean> {
    return this.authService.logout(id);
  }

  @Get('profile')
  @ApiBearerAuth()
  getProfile(@GetAuthUser() user: AuthUser): AuthUser {
    return user;
  }
}
