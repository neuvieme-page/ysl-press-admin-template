import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MulterModule } from '@nestjs/platform-express'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../user/users.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { configService } from '../config/config.service'
import { SessionModule } from 'nestjs-session'
import { IdentitiesModule } from '../identity/identities.module'
import { BackofficeModule } from '../backoffice/backoffice.module'
import { VersionsModule } from '../version/versions.module'
import { GroupsModule } from '../group/group.module'
import { GridsModule } from '../grid/grid.module'
import { MediasModule } from '../media/medias.module'
import { FilesModule } from '../file/file.module'
import { OptionsModule } from '../options/options.module'
@Module({
  imports: [
    ConfigModule.forRoot(),
    SessionModule.forRoot({
      session: { secret: configService.getSecret() },
    }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    AuthModule,
    UsersModule,
    IdentitiesModule,
    BackofficeModule,
    VersionsModule,
    GroupsModule,
    GridsModule,
    MediasModule,
    FilesModule,
    OptionsModule,
    MulterModule.register({
      dest: './tmp',
      limits: {
        fileSize: 4096 * 1024 * 1024, // no larger than 4gb, you can change as needed.
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
