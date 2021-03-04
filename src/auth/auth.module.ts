import { PassportModule } from '@nestjs/passport'
import { Module, Provider } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { LocalStrategy } from './local/local.strategy'
import { UsersModule } from '../user/users.module'
import { AuthLocalService } from './local/local.service'
import { AuthLocalGuard } from './local/local.guard'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt/jwt.strategy'
import { TwitterStrategy } from './twitter/twitter.strategy'
import { IdentitiesModule } from '../identity/identities.module'
import { configService } from '../config/config.service'

const providers: Array<Provider> = [
  AuthLocalService,
  LocalStrategy,
  JwtStrategy,
  AuthLocalGuard,
]
if (configService.getProvider('twitter')) {
  providers.push(TwitterStrategy)
}

@Module({
  imports: [
    UsersModule,
    IdentitiesModule,
    PassportModule,
    JwtModule.register({
      secret: configService.getSecret(),
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers,
  exports: [AuthLocalService],
  controllers: [AuthController],
})
export class AuthModule {}
