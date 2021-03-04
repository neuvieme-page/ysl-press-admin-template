import { ApiProperty } from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm'
import { Version } from '../version/version.entity'
import { GridItem } from './grid_item.entity'

@Entity()
export class Grid {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column()
  width: number

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  createdAt: Date

  @OneToOne(type => Version)
  version: Version

  @OneToMany(
    () => GridItem,
    item => item.grid,
    { cascade: true },
  )
  items: GridItem[]

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  updatedAt: Date
}
