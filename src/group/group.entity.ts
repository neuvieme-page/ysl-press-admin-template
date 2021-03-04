import { ApiProperty } from '@nestjs/swagger'
import { Version } from '../version/version.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { File } from '../file/file.entity'

export enum ClickItemBehaviour {
  DEFAULT = 'default',
  INACTIVE = 'inactive'
}

@Entity()
export class Group {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column({ default: 1 })
  rank: number

  @ApiProperty()
  @Column({ nullable: true })
  description: string

  @OneToOne(() => File, { eager: true, nullable: true })
  @JoinColumn()
  archive: File

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  createdAt: Date

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  updatedAt: Date

  @ManyToMany(
    () => Version,
    version => version.groups,
  )
  versions: Version[]

  // eslint-disable-next-line
  @ApiProperty()
  @Column({ default: 6, nullable: true })
  popinColumnsCount: number

  @ApiProperty({ enum: ClickItemBehaviour })
  @Column({ default: ClickItemBehaviour.DEFAULT, nullable: true })
  clickItemBehaviour: ClickItemBehaviour
}
