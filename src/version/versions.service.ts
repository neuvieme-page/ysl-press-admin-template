import { Injectable, NotFoundException } from '@nestjs/common'
import { Version } from './version.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { ExportVersionDTO, ImportVersionDTO } from './dto/version.dto'
import { GridsService } from '../grid/grid.service'
import { ImportGridDTO } from '../grid/dto/grid.dto'
import validate from '../helpers/validate'
import { plainToClass } from 'class-transformer'
import { Group } from '../group/group.entity'
import { ImportJoinGroupDTO } from '../group/dto/group.dto'
import { filterDistinctIds } from '../helpers/filter-distinct-id'
import { FilesService } from '../file/files.service'
import { File as FileEntity } from '../file/file.entity'
import { actionLog, log, successLog } from '../helpers/log'

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(Version)
    private readonly repository: Repository<Version>,
    private readonly gridService: GridsService,
    private readonly filesService: FilesService,
  ) {}

  async findAll(): Promise<Version[]> {
    return this.repository.find()
  }

  async findOne(id: number): Promise<ExportVersionDTO> {
    const entity = await this.repository.findOne(id, {
      relations: ['gridDesktop', 'gridMobile', 'groups'],
    })
    if (!entity) return null
    entity.gridDesktop = await this.gridService.findOne(entity.gridDesktopId)
    entity.gridMobile = await this.gridService.findOne(entity.gridMobileId)

    return plainToClass(ExportVersionDTO, entity)
  }

  async findOneByAuth(password: string): Promise<ExportVersionDTO> {
    const d = new Date()
    const entity = await this.repository.findOne(
      { password, startAt: LessThanOrEqual(d), endAt: MoreThanOrEqual(d) },
      { relations: ['groups'] },
    )
    if (!entity) throw new NotFoundException()
    entity.gridDesktop = await this.gridService.findOne(entity.gridDesktopId)
    entity.gridMobile = await this.gridService.findOne(entity.gridMobileId)
    return plainToClass(ExportVersionDTO, entity)
  }

  formatJoinIds(ids: number[]): ImportJoinGroupDTO[] {
    return ids.map(id => new Object({ id })) as ImportJoinGroupDTO[]
  }

  async create(dto: ImportVersionDTO): Promise<ExportVersionDTO> {
    // Validate and format dtos
    const formatedDTO = await validate<ImportVersionDTO>(
      dto,
      ImportVersionDTO,
      true,
      ['CREATE'],
    )
    const gridMobileDTO = await validate<ImportGridDTO>(
      dto.gridMobile ? { width: 3, ...dto.gridMobile } : { width: 3 },
      ImportGridDTO,
    )
    const gridDesktopDTO = await validate<ImportGridDTO>(
      dto.gridDesktop ? { width: 5, ...dto.gridDesktop } : { width: 5 },
      ImportGridDTO,
    )

    log({ title: 'VersionService', description: `Format dtos for version` })

    // Create children
    const gridDesktop = await this.gridService.create(gridDesktopDTO)
    const gridMobile = await this.gridService.create(gridMobileDTO)

    // Create entity and assign children
    const entity = this.repository.create(formatedDTO)

    successLog({ title: 'VersionService', description: `Successfully version created` })
    entity.gridMobile = gridMobile
    entity.gridDesktop = gridDesktop

    // Handle groups
    if (formatedDTO.groups && formatedDTO.groups.length >= 0) {
      const groups = formatedDTO.groups
      delete formatedDTO.groups
      entity.groups = filterDistinctIds<Group>(
        groups.map(g => {
          const group = new Group()
          group.id = g.id
          return group
        }),
      )
      log({ title: 'VersionService', description: `Format groups` })
    }

    // Perform saving
    const version = await this.repository.save(entity)
    successLog({ title: 'VersionService', description: `Successfully version updated with formated groups` })

    return this.findOne(version.id)
  }

  async update(id: number, dto: ImportVersionDTO): Promise<ExportVersionDTO> {
    // Validate and format dtos
    const formatedDTO = await validate<ImportVersionDTO>(
      dto,
      ImportVersionDTO,
      true,
      ['UPDATE'],
    )
    const gridMobileDTO =
      dto.gridMobile &&
      (await validate<ImportGridDTO>(dto.gridMobile, ImportGridDTO, true))
    const gridDesktopDTO =
      dto.gridDesktop &&
      (await validate<ImportGridDTO>(dto.gridDesktop, ImportGridDTO, true))

    log({ title: 'VersionService', description: `Format dtos for version ${id}` })

    // Find correct entity based on id
    const entity = await this.repository.findOne(id)

    // Handle groups
    if (formatedDTO.groups && formatedDTO.groups.length >= 0) {
      const groups = formatedDTO.groups
      delete formatedDTO.groups
      entity.groups = filterDistinctIds<Group>(
        groups.map(g => {
          const group = new Group()
          group.id = g.id
          return group
        }),
      )
      log({ title: 'VersionService', description: `Format pathed groups` })
    }
    await this.repository.save(entity)
    successLog({ title: 'VersionService', description: `Successfully groups' version update` })

    // Perform updates
    if (gridMobileDTO)
      await this.gridService.update(entity.gridMobileId, gridMobileDTO)
    if (gridDesktopDTO)
      await this.gridService.update(entity.gridDesktopId, gridDesktopDTO)
    await this.repository.update(id, formatedDTO)
    successLog({ title: 'VersionService', description: `Successfull version update` })

    // Return formated and saved content
    return await this.findOne(id)
  }

  async deleteFile(entity: Version, key: string): Promise<Version> {
    const file =
      entity[key] && entity[key] instanceof FileEntity ? entity[key] : null
    if (file) {
      entity[key] = null
      entity = await this.repository.save(entity)
      await this.filesService.delete(file.id)
      successLog({ title: 'VersionService', description: `Successfully ${key} file deleted` })
    }
    return entity
  }

  async updateFile(entity: Version, key: string, file: File): Promise<Version> {
    if (file) {
      actionLog({ title: 'VersionService', description: `Update file ${key}` })
      if (entity[key]) {
        entity = await this.deleteFile(entity, key)
      }
      // Create new archive
      const fileEntity = await this.filesService.create(file)
      if (fileEntity) {
        entity[key] = fileEntity
        this.repository.save(entity)
        successLog({ title: 'VersionService', description: `File ${key} successfully added` })
      }
    }
    return entity
  }

  async updateAttachment(
    id,
    { archive, pressRelease }: { [key: string]: File[] },
  ) {
    let entity = await this.repository.findOne(id)
    entity = await this.updateFile(entity, 'archive', archive && archive[0])
    entity = await this.updateFile(
      entity,
      'pressRelease',
      pressRelease && pressRelease[0],
    )
    return entity
  }

  async delete(id: number): Promise<void> {
    const user = await this.repository.findOne(id)
    try {
      await this.repository.remove(user)
      successLog({ title: 'VersionService', description: `Version with id "${id}" successfully deleted` })
      await this.gridService.delete(user.gridDesktopId)
      successLog({ title: 'VersionService', description: `Grid Desktop successfully deleted` })
      await this.gridService.delete(user.gridMobileId)
      successLog({ title: 'VersionService', description: `Grid Mobile successfully deleted` })
    } catch (error) {
      console.log(error)
    }
    return
  }
}
