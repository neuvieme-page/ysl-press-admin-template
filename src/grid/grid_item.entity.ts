import { ApiProperty } from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Grid } from './grid.entity'
import { Media } from '../media/media.entity'

@Entity()
export class GridItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    () => Grid,
    grid => grid.items,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  grid: Grid

  @Column()
  gridId: number

  @ApiProperty()
  @Column()
  col: number

  @ApiProperty()
  @Column()
  row: number

  @ApiProperty()
  @Column()
  width: number

  @ApiProperty()
  @Column()
  height: number

  @ManyToOne(() => Media, { nullable: true, eager: true })
  media: Media

  @Column({ nullable: true })
  mediaId: number | null = null
}
