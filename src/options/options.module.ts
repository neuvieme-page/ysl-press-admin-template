import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { Option } from './options.entity'
import { OptionsService } from './options.service'
import { OptionsController } from './options.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Option])],
  providers: [OptionsService],
  exports: [OptionsService, TypeOrmModule],
  controllers: [OptionsController],
})
export class OptionsModule {}
