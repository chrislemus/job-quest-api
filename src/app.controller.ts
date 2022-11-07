import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SkipAuth } from './auth/decorators';

@Controller()
export class AppController {
  @SkipAuth()
  @Get('')
  @Redirect('api')
  @ApiExcludeEndpoint()
  login(): void {
    return;
  }
}
