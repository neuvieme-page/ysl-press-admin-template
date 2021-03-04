import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { MediasService } from './medias.service'
import { Media } from './media.entity'
import { MediaSubscriber } from './media.subscriber'
import { MediaController } from './medias.controller'
import { File } from '../file/file.entity'
import { FilesService } from '../file/files.service'
import { MediasHelper } from './medias.helper'
import { ImageService } from './image.service'
import { GroupsService } from '../group/group.service'
import { Group } from '../group/group.entity'
import { GridItem } from 'src/grid/grid_item.entity'
import { VideoService } from './video.service'

@Module({
  imports: [TypeOrmModule.forFeature([Media, File, Group, GridItem])],
  providers: [
    MediasService,
    MediaSubscriber,
    FilesService,
    GroupsService,
    MediasHelper,
    ImageService,
    VideoService
  ],
  exports: [MediasService, TypeOrmModule],
  controllers: [MediaController],
})
export class MediasModule {}
