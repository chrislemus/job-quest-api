import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@app/user/dto';
import bcrypt from 'bcryptjs';
import { PrismaService } from '@app/prisma';
import { ConfigService } from '@nestjs/config';
import { AuthTokens, AuthUser } from './dto';
import { UserEntity } from '@app/user/user.entity';
import { JobListDataService } from '@app/job/job-list-data.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private jobListData: JobListDataService,
  ) {}

  /**  User local login. */
  async localLogin(user: AuthUser): Promise<AuthTokens> {
    return this.getTokens(user);
  }

  /**  Refresh auth JWT. */
  async refreshJwt(user: AuthUser): Promise<AuthTokens> {
    return this.getTokens(user);
  }

  /**  Default hash encryption. */
  private async hashValue(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value, salt);
    return hash;
  }

  /**  Generates and returns auth tokens. */
  async getTokens(user: AuthUser): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(user, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '20m',
      }),
      this.jwtService.signAsync(user, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    await this.syncRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  /**  Sync refresh token with DB for persistence. */
  async syncRefreshToken(userId: number, refreshToken: string): Promise<void> {
    try {
      const hashRt = await this.hashValue(refreshToken);
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: hashRt },
      });
    } catch (error) {
      this.logger.error('Unable to sync refresh token to database:::', error);
      throw new InternalServerErrorException();
    }
  }

  /** Logout user (removes refresh token from DB). */
  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: { not: null },
      },
      data: { refreshToken: null },
    });
    return true;
  }

  /**  New user signup. */
  async signup(newUserData: CreateUserDto) {
    const password = await this.hashValue(newUserData.password);

    // create user with default job lists
    const { jobLists, ...user } = await this.prisma.user.create({
      include: { jobLists: { orderBy: { order: 'asc' }, take: 1 } },
      data: {
        ...newUserData,
        role: 'SUBSCRIBER',
        password,
        jobLists: {
          createMany: {
            data: [
              { label: 'Queue', order: 1 },
              { label: 'Applied', order: 2 },
              { label: 'Interview', order: 3 },
              { label: 'Offer', order: 4 },
              { label: 'Rejected', order: 5 },
            ],
          },
        },
      },
    });

    // extract first job list, base on db query we
    // should expect an array with length of 1.
    const firstJobList = jobLists[0];

    // TODO: extract this logic into a more suitable service
    const { jobListRank, jobListId } = await this.jobListData.getJobListData({
      id: firstJobList.id,
    });
    // create sample job
    await this.prisma.job.create({
      data: {
        title: 'Sale Associate',
        company: 'Job Quest',
        location: 'Raleigh, NC',
        salary: '50k',
        color: '#e91e63',
        description: 'This is a sample job',
        userId: user.id,
        jobListId,
        jobListRank,
      },
    });

    //get tokens and return
    const tokens = await this.getTokens(user);
    return tokens;
  }

  /**
   * Register user as admin(when app runs in new env for first time and no admin users exist).
   */
  async registerAdmin(userId: number, adminKey: string): Promise<UserEntity> {
    const existingAdminUser = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    const noAdminRegistered = existingAdminUser === null;
    if (!noAdminRegistered) throw new Error('Admin already registered');

    const expectedAdminKey =
      this.configService.get<string>('ADMIN_REGISTER_KEY');

    const validAdminKey = expectedAdminKey === adminKey;
    if (!validAdminKey) throw new Error('Invalid admin key');

    const adminUser = await this.prisma.user.update({
      data: { role: 'ADMIN' },
      where: { id: userId },
    });

    return new UserEntity(adminUser);
  }
}
