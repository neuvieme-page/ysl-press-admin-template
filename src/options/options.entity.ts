import { ApiProperty } from '@nestjs/swagger'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm'

@Entity()
export class Option {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column()
  key: string

  @ApiProperty()
  @Column()
  value: string
}
