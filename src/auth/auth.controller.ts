import { GetAuthUser } from '@app/common/decorators';
import { CreateUserDto } from '@app/users/dto';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import {
  RegisterAdminDto,
  AuthTokens,
  AuthUser,
  UserLoginReqDto,
  UserProfile,
} from './dto';
import { JwtRefreshAuthGuard, LocalAuthGuard } from './guards';
import { AuthUserWithRefreshToken } from './types';

@Controller('auth')
@ApiBearerAuth()
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

  @Post('register-admin')
  @HttpCode(HttpStatus.OK)
  async registerAdmin(
    @Body() registerAdminDto: RegisterAdminDto,
    @GetAuthUser('id') id: number,
  ): Promise<UserProfile> {
    try {
      const admin = await this.authService.registerAdmin(
        id,
        registerAdminDto.adminKey,
      );
      return admin;
    } catch (_error) {
      throw new ForbiddenException();
    }
  }

  @Get('profile')
  getProfile(@GetAuthUser('id') userId: number): Promise<UserProfile> {
    return this.authService.getUserProfile(userId);
  }
}
