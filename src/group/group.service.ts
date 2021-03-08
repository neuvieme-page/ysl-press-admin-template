import { Injectable } from '@nestjs/common'
import { Group } from './group.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { ImportGroupDTO } from './dto/group.dto'
import { File } from 'multer'
import { FilesService } from '../file/files.service'
import { File as FileEntity } from '../file/file.entity'
import validate from '../helpers/validate'
import { actionLog, successLog } from '../helpers/log'

@Injectable()
export class GroupsService {
  private readonly groups: Group[]

  constructor(
    @InjectRepository(Group)
    private repository: Repository<Group>,
    private connection: Connection,
    private filesService: FilesService,
  ) {}

  private async updateFile(entity: Group, file: FileEntity): Promise<boolean> {
    if (file) {
      actionLog({ title: 'GroupService', description: `Update archive for group "${entity.id}"`})
      // If archive, delete it
      if (entity.archive) {
        const archive = entity.archive
        entity.archive = null
        entity = await this.repository.save(entity)

        const success = await this.filesService.delete(archive.id)
        
        if (!success) return false
        successLog({ title: 'GroupService', description: `Old archive successfully deleted`})
      }

      // Create new archive
      const fileEntity = await this.filesService.create(file)
      if (fileEntity) {
        entity.archive = fileEntity
        this.repository.save(entity)
        successLog({ title: 'GroupService', description: `New archive successfully added`})
      }

      return true
    }

    return false
  }

  async findAll(): Promise<Group[]> {
    return this.repository.find({ order: { rank: 'ASC' }})
  }

  async findOne(id: number): Promise<Group> {
    return this.repository.findOne(id)
  }

  async create(dto: ImportGroupDTO, file: File): Promise<Group> {
    let entity = this.repository.create(dto)
    entity = await this.repository.save(entity)
    await this.updateFile(entity, file)
    successLog({ title: 'GroupService', description: `Group sucessfully created`})
    return entity
  }

  async update(id: number, dto: ImportGroupDTO, file: File): Promise<Group> {
    const formatedDTO = await validate<ImportGroupDTO>(
      dto,
      ImportGroupDTO,
      true,
      ['UPDATE'],
    )
    await this.repository.update(id, formatedDTO)

    const entity = await this.repository.findOne(id)
    await this.updateFile(entity, file)
    successLog({ title: 'GroupService', description: `Group sucessfully updated`})
    return entity
  }

  async delete(id: number): Promise<void> {
    const entity = await this.repository.findOne(id)
    if (entity.archive) {
      const archive = entity.archive
      entity.archive = null
      this.repository.save(entity)

      await this.filesService.delete(archive.id)
      successLog({ title: 'GroupService', description: `Group archive sucessfully deleted`})
    }

    await this.repository.delete(id)
    successLog({ title: 'GroupService', description: `Group sucessfully deleted`})
  }
}
