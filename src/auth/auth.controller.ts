import { GetAuthUser } from '@app/common/decorators';
import { CreateUserDto } from '@app/user/dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import { RegisterAdminDto, AuthTokens, AuthUser, UserLoginReqDto } from './dto';
import { JwtRefreshAuthGuard, LocalAuthGuard } from './guards';
import { AuthUserWithRefreshToken } from './types';
import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * User Login
   */
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: UserLoginReqDto })
  login(@GetAuthUser() user: AuthUser): Promise<AuthTokens> {
    return this.authService.localLogin(user);
  }

  /**
   * User Signup
   */
  @SkipAuth()
  @Post('signup')
  signup(@Body() user: CreateUserDto): Promise<AuthTokens> {
    return this.authService.signup(user);
  }

  /**
   * Refresh Auth JWT
   */
  @SkipAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refreshTokens(
    @GetAuthUser() user: AuthUserWithRefreshToken,
  ): Promise<AuthTokens> {
    return this.authService.refreshJwt(user.id, user.refreshToken);
  }

  /**
   * User Logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetAuthUser('id') id: number): Promise<boolean> {
    return this.authService.logout(id);
  }

  /**
   *
   * Register admin for the first time to activate app
   */
  @Post('register-admin')
  @HttpCode(HttpStatus.OK)
  async registerAdmin(
    @Body() registerAdminDto: RegisterAdminDto,
    @GetAuthUser('id') id: number,
  ): Promise<UserEntity> {
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
}
