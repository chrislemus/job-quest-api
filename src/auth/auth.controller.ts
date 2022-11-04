import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return loginDto;
  }
  // constructor(private readonly authService: AuthService) {}
  // @Post('login')
  // login(@Body() loginDto: LoginDto) {
  //   return this.authService.authenticateUser(loginDto).catch((e) => {
  //     throw new BadRequestException(e.message);
  //   });
  // }
  // @Post('signup')
  // signup(@Body() signupDto: SignupDto) {
  //   return this.authService.signup(signupDto).catch((e) => {
  //     throw new BadRequestException(e.message);
  //   });
  // }
}
