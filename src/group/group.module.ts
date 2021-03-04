import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { GroupsService } from './group.service'
import { Group } from './group.entity'
import { GroupSubscriber } from './group.subscriber'
import { GroupController } from './group.controller'
import { FilesService } from '../file/files.service'
import { File } from '../file/file.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Group, File])],
  providers: [GroupsService, GroupSubscriber, FilesService],
  exports: [GroupsService, TypeOrmModule],
  controllers: [GroupController],
})
export class GroupsModule {}
