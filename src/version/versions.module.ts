import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { VersionsService } from './versions.service'
import { Version } from './version.entity'
import { VersionSubscriber } from './version.subscriber'
import { VersionController } from './versions.controller'
import { GridsService } from '../grid/grid.service'
import { Grid } from '../grid/grid.entity'
import { GridItem } from '../grid/grid_item.entity'
import { GroupsService } from '../group/group.service'
import { Group } from '../group/group.entity'
import { File } from '../file/file.entity'
import { FilesService } from '../file/files.service'

@Module({
  imports: [TypeOrmModule.forFeature([Version, Grid, GridItem, Group, File])],
  providers: [
    VersionsService,
    GridsService,
    VersionSubscriber,
    GroupsService,
    FilesService,
  ],
  exports: [VersionsService, TypeOrmModule],
  controllers: [VersionController],
})
export class VersionsModule {}
