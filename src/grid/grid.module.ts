import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { GridsService } from './grid.service'
import { Grid } from './grid.entity'
import { GridItem } from './grid_item.entity'
import { GridSubscriber } from './grid.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([Grid, GridItem])],
  providers: [GridsService, GridSubscriber],
  exports: [GridsService, TypeOrmModule],
  controllers: [],
})
export class GridsModule {}
