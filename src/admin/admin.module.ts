import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './user/user.module';
const modules = [UserModule];

const registerRouterModules = modules.map((module) => ({
  path: 'admin',
  module,
}));

@Module({
  imports: [...modules, RouterModule.register(registerRouterModules)],
})
export class AdminModule {}
