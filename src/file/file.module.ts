import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { File } from './file.entity'
import { FileSubscriber } from './file.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FilesService, FileSubscriber],
  exports: [FilesService, TypeOrmModule],
  controllers: [],
})
export class FilesModule {}
