import { ApiProperty } from '@nestjs/swagger'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class File {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column({ nullable: true })
  name: string

  @ApiProperty()
  @Column()
  url: string

  @ApiProperty()
  @Column()
  mimetype: string

  @ApiProperty()
  @Column()
  size: number

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  createdAt: Date
}
