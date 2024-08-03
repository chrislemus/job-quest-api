import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto';
import { ConfigService } from '@nestjs/config';
import { AuthTokens, AuthUser } from './dto';
import { UserService } from 'src/user/user.service';
import { UserDBService } from 'src/db/user-db.service';
import { hashValue } from './hash-value.util';
import { jwtExpiryConfig } from './jwt-expiry.config';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
    private userDB: UserDBService,
  ) {}

  /**  User local login. */
  async localLogin(user: AuthUser): Promise<AuthTokens> {
    return this.getTokens(user);
  }

  /**  Refresh auth JWT. */
  async refreshJwt(user: AuthUser): Promise<AuthTokens> {
    return this.getTokens(user);
  }

  /**  Generates and returns auth tokens. */
  async getTokens(user: AuthUser): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(user, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: jwtExpiryConfig.accessTokenExpiry,
      }),
      this.jwtService.signAsync(user, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: jwtExpiryConfig.refreshTokenExpiry,
      }),
    ]);

    await this.syncRefreshToken(user, refreshToken);
    return { accessToken, refreshToken };
  }

  /**  Sync refresh token with DB for persistence. */
  async syncRefreshToken(user: AuthUser, refreshToken: string): Promise<void> {
    try {
      const hashRt = await hashValue(refreshToken);
      await this.userDB.update({
        id: user.id,
        refreshToken: hashRt,
      });
      // await this.prisma.user.update({
      //   where: { id: userId },
      //   data: { refreshToken: hashRt },
      // });
    } catch (error) {
      this.logger.error('Unable to sync refresh token to database:::', error);
      throw new InternalServerErrorException();
    }
  }

  /** Logout user (removes refresh token from DB). */
  async logout(user: AuthUser): Promise<boolean> {
    // await this.prisma.user.updateMany({
    //   where: {
    //     id: user.id,
    //     refreshToken: { not: null },
    //   },
    //   data: { refreshToken: null },
    // });
    await this.userDB.update({
      id: user.id,
      refreshToken: undefined,
    });
    return true;
  }

  /**  New user signup. */
  async signup(newUserData: CreateUserDto) {
    const password = await hashValue(newUserData.password);

    // create user with default job lists
    // const { ...user } = await this.prisma.user.create({
    //   data: {
    //     ...newUserData,
    //     role: 'SUBSCRIBER',
    //     password,
    //   },
    // });

    const userExists = await this.userDB
      .findByEmail(newUserData.email)
      .then((res) => !!res)
      .catch((error) => {
        if (error.status === 404) return false;
        this.logger.error(JSON.stringify(error));
        throw error;
      });

    if (userExists) {
      throw new BadRequestException(
        'User with this email already exists' + newUserData.email,
      );
    }
    const user = await this.userDB.create({
      ...newUserData,
      role: 'SUBSCRIBER',
      password,
    });

    if (!user) return new InternalServerErrorException('User creation failed');

    await this.userService.createNewUserStarterData(user);

    //get tokens and return
    const tokens = await this.getTokens(user);
    return tokens;
  }

  /**
   * Register user as admin(when app runs in new env for first time and no admin users exist).
   */
  // async registerAdmin(user: AuthUser, adminKey: string): Promise<UserEntity> {
  //   const existingAdminUser = await this.prisma.user.findFirst({
  //     where: { role: 'ADMIN' },
  //   });

  //   const noAdminRegistered = existingAdminUser === null;
  //   if (!noAdminRegistered) throw new Error('Admin already registered');

  //   const expectedAdminKey =
  //     this.configService.get<string>('ADMIN_REGISTER_KEY');

  //   const validAdminKey = expectedAdminKey === adminKey;
  //   if (!validAdminKey) throw new Error('Invalid admin key');

  //   const adminUser = await this.prisma.user.update({
  //     data: { role: 'ADMIN' },
  //     where: { id: user.id },
  //   });

  //   return new UserEntity(adminUser);
  // }
}
