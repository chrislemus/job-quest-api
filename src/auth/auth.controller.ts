import { AuthUserId, AuthUser } from '@app/common/decorators';
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import { UserLoginReqDto } from './dto';
import { JwtRefreshAuthGuard, LocalAuthGuard } from './guards';
import { AuthTokens, JwtPayloadWithRefreshToken, LocalPayload } from './types';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    // body added for validation / documentation(swagger ui)
    @Body() _user: UserLoginReqDto,
    @Req() req: Request,
  ): Promise<AuthTokens> {
    const user = req.user as LocalPayload;
    return this.authService.localLogin(user.id, user.email);
  }

  @SkipAuth()
  @Post('signup')
  signup(@Body() user: CreateUserDto) {
    return this.authService.signup(user);
  }

  @SkipAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refreshTokens(
    @AuthUserId() userId: number,
    @Req() req: Request,
  ): Promise<AuthTokens> {
    /** {@link JwtPayloadWithRefreshToken} is injected by {@link JwtRefreshAuthGuard} */
    const user = req.user as JwtPayloadWithRefreshToken;
    return this.authService.refreshJwt(userId, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@AuthUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req) {
    return req.user;
  }
}
