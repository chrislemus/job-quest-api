import { GetAuthUser } from 'src/common/decorators';
import { CreateUserDto } from 'src/user/dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators';
import { RegisterAdminDto, AuthTokens, AuthUser, UserLoginReqDto } from './dto';
import { JwtRefreshAuthGuard, LocalAuthGuard } from './guards';
import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from 'src/user/user.entity';

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
  signup(
    @Body() user: CreateUserDto,
  ): Promise<AuthTokens | InternalServerErrorException> {
    return this.authService.signup(user);
  }

  /**
   * Refresh Auth JWT
   */
  @SkipAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refreshTokens(@GetAuthUser() user: AuthUser): Promise<AuthTokens> {
    return this.authService.refreshJwt(user);
  }

  /**
   * User Logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetAuthUser() user: AuthUser): Promise<boolean> {
    return this.authService.logout(user);
  }

  // /**
  //  *
  //  * Register admin for the first time to activate app
  //  */
  // @Post('register-admin')
  // @HttpCode(HttpStatus.OK)
  // async registerAdmin(
  //   @Body() registerAdminDto: RegisterAdminDto,
  //   @GetAuthUser() user: AuthUser,
  // ): Promise<UserEntity> {
  //   try {
  //     const admin = await this.authService.registerAdmin(
  //       user,
  //       registerAdminDto.adminKey,
  //     );
  //     return admin;
  //   } catch (_error) {
  //     throw new ForbiddenException();
  //   }
  // }
}
