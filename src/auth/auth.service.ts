import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@app/users/users.service';
import { AuthUser } from './dto';
import { CreateUserDto } from '@app/users/dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    const user = await this.usersService.findUniqueByEmail(email);
    const userHashPassword = user?.password;
    if (userHashPassword) {
      const isMatch = await bcrypt.compare(pass, userHashPassword);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...authUser } = user;
        return authUser;
      }
    }
    return null;
  }

  createJwt(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(newUserData: CreateUserDto) {
    const user = await this.usersService.createUser(newUserData);
    return this.createJwt(user);
  }
}
