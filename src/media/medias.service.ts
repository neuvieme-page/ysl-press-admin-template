import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Media } from './media.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { getConnection, Repository, In } from 'typeorm'
import {
  ExportBaseMediaDTO,
  ImportMediaDTO,
  PatchMediaDTO,
} from './dto/media.dto'
import { plainToClass } from 'class-transformer'
import { FilesService } from '../file/files.service'
import { MediasHelper } from './medias.helper'
import { File } from 'multer'
import { GroupsService } from '../group/group.service'
import validate from '../helpers/validate'
import { GridItem } from '../grid/grid_item.entity'
import { filterDistinctIds } from '../helpers/filter-distinct-id'
import { Group } from '../group/group.entity'
import { successLog } from '../helpers/log'


@Injectable()
export class MediasService {
  constructor(
    @InjectRepository(Media)
    private readonly repository: Repository<Media>,
    @InjectRepository(GridItem)
    private readonly gridItemsRepository: Repository<GridItem>,
    private readonly fileService: FilesService,
    private readonly helper: MediasHelper,
    private readonly groupService: GroupsService,
  ) {}

  async findAll(): Promise<Media[]> {
    const medias = await this.repository.find({
      order: { updatedAt: 'DESC' }
    })
    return await Promise.all(medias.map(async (m) => await validate<Media>(m, Media, true)))
  }

  async delete(id: number) {
    const entity = await this.repository.findOne(id)
    if (!entity) throw new NotFoundException(`can't find media with id ${id}`)
    const item = await this.gridItemsRepository.findOne({ mediaId: id })
    if (item) throw new UnauthorizedException(`can't delete media with id '${id}', this media is used in item '${item.id}'`)

    const originId = entity.origin.id
    const thumbnailId = entity.thumbnail ? entity.thumbnail.id : null

    await this.repository.delete(entity.id)
    successLog({ title: "MediasService", description: `Successfully deleted entity with id "${entity.id}"` })

    if (thumbnailId) await this.fileService.delete(thumbnailId)
    if (originId) return await this.fileService.delete(originId)
    return false
  }

  async create(
    file: File,
    params: ImportMediaDTO,
  ): Promise<ExportBaseMediaDTO> {
    if (!file) throw new BadRequestException('File is required')
    if (!params) throw new BadRequestException('Params is required')

    // "3" => ["3"] // ["3", "4"] => ["3", "4"] // undefined => []
    const groupsAsArray = params.groups
      ? params.groups instanceof Array
        ? params.groups
        : [params.groups]
      : []
    const groups = await Promise.all(
      groupsAsArray.map(async g => {
        const group = await this.groupService.findOne(Number(g))
        if (!group) throw new NotFoundException(`can't find group with id ${g}`)
        return group
      }),
    )

    delete params.groups
    const mediaFormatedDTO = await this.helper.handleMedia(file, params)

    const entity = this.repository.create(mediaFormatedDTO)
    entity.groups = groups

    const mediaSaved = await this.repository.save(entity)
    successLog({ title: "MediasService", description: `Successfully create entity with id "${mediaSaved.id}"` })
    return this.findOne(mediaSaved.id)
  }

  async update(id: number, dto: PatchMediaDTO): Promise<Media> {
    const formatedDTO = await validate<PatchMediaDTO>(dto, PatchMediaDTO, true)
    const entity = await this.repository.findOne(id)

    // Handle groups
    const groups = formatedDTO.groups
    delete formatedDTO.groups
    if (groups && groups.length >= 0) {  
      entity.groups = filterDistinctIds<Group>(groups.map(g => {
        const group = new Group()
        group.id = g.id
        return group
      }))
      await this.repository.save(entity)
    }    

    await this.repository.update(id, formatedDTO)
    const output = await this.repository.findOne(id);
    successLog({ title: "MediasService", description: `Successfully update entity with id "${output.id}"` })
    return output
  }

  async findOne(id: number): Promise<ExportBaseMediaDTO> {
    const entity = await this.repository.findOne(id)
    if (!entity) return null
    return plainToClass(ExportBaseMediaDTO, entity)
  }

  async findAllByAuth(password) {
    const q = (
      await getConnection().query(
        `
      SELECT DISTINCT m.id FROM media as m
      LEFT JOIN media_groups_group as mg 
      ON mg."mediaId" = m.id
      LEFT JOIN version_groups_group as vg
      ON vg."groupId" = mg."groupId"
      LEFT JOIN version as v 
      ON vg."versionId" = v.id
      WHERE v.password = $1 AND 1 = 1`,
        [password],
      )
    ).map(m => m.id)

    if (q.length) {
      return await this.repository.find({
        where: { id: In(q) },
      })
    }

    return []
  }
}
