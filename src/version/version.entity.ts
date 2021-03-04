import { ApiProperty } from '@nestjs/swagger'
import { Grid } from '../grid/grid.entity'
import { Group } from '../group/group.entity'
import { File } from '../file/file.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'

@Entity()
export class Version {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column()
  password: string

  @ApiProperty()
  @Column()
  canDownload: boolean

  @OneToOne(
    () => Grid,
    grid => grid.version,
  )
  @JoinColumn()
  gridDesktop: Grid

  @OneToOne(
    () => Grid,
    grid => grid.version,
  )
  @JoinColumn()
  gridMobile: Grid

  @Column()
  gridDesktopId: number

  @Column()
  gridMobileId: number

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  createdAt: Date

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  startAt: Date

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  endAt: Date

  @ManyToMany(() => Group, { cascade: true, eager: true })
  @JoinTable({
    joinColumn: { name: 'versionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'groupId', referencedColumnName: 'id' },
  })
  groups: Group[]

  @ApiProperty()
  @Column({
    default: new Date(),
  })
  updatedAt: Date

  @OneToOne(() => File, { eager: true, nullable: true })
  @JoinColumn()
  archive: File

  @OneToOne(() => File, { eager: true, nullable: true })
  @JoinColumn()
  pressRelease: File
}
