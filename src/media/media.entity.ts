import { ApiProperty } from '@nestjs/swagger'
import { Group } from '../group/group.entity'
import { Exclude } from 'class-transformer'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { File } from '../file/file.entity'

export enum MediaType {
  Image = 'image',
  Video = 'video',
  Youtube = 'youtube',
}

@Entity()
export class Media {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column({ nullable: true })
  name: string

  @ApiProperty()
  @Column()
  type: MediaType

  @ApiProperty()
  @Column({ nullable: true })
  url: string

  @ApiProperty()
  @Column()
  width: number

  @ApiProperty()
  @Column()
  height: number

  @OneToOne(() => File, { eager: true })
  @JoinColumn()
  originFile: File

  @Column({ nullable: true })
  @Exclude()
  originFileId: number

  @OneToOne(() => File, { eager: true })
  @JoinColumn()
  gridFile: File

  @Column({ nullable: true })
  @Exclude()
  gridFileId: number

  @OneToOne(() => File, { eager: true })
  @JoinColumn()
  popinFile: File

  @Column({ nullable: true })
  @Exclude()
  popinFileId: number

  @ManyToMany(() => Group, { cascade: true, eager: true })
  @JoinTable({
    joinColumn: { name: 'mediaId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'groupId', referencedColumnName: 'id' },
  })
  groups: Group[]

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
}
