import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import bcrypt from 'bcryptjs';
import { LocalPayload } from '../types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<LocalPayload> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user?.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return { id: user.id, email: user.email, role: user.role };
      }
    }
    throw new UnauthorizedException();
  }
}
