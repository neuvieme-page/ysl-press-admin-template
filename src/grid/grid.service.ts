import { Injectable } from '@nestjs/common'
import { Grid } from './grid.entity'
import { GridItem } from './grid_item.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ImportGridDTO, GridUpdateDTO } from './dto/grid.dto'
import validate from '../helpers/validate'
import { GridItemDTO } from './dto/grid_item.dto'

@Injectable()
export class GridsService {
  constructor(
    @InjectRepository(Grid)
    private repository: Repository<Grid>,
    @InjectRepository(GridItem)
    private itemRepository: Repository<GridItem>,
  ) {}

  async findAll(): Promise<Grid[]> {
    return this.repository.find()
  }

  async findOne(id: number): Promise<Grid> {
    return await this.repository.findOne(id, { relations: ['items'] })
  }

  async create(dto: ImportGridDTO): Promise<Grid> {
    const gridFormated = await validate<GridUpdateDTO>(
      dto,
      GridUpdateDTO,
      true,
      ['CREATE'],
    )
    const entity = this.repository.create(gridFormated)
    const grid = await this.repository.save(entity)
    this.updateItems(grid.id, dto)
    return grid
  }

  async updateItems(id: number, dto: ImportGridDTO) {
    if (!dto.items) return
    const items = (await Promise.all(
      dto.items.map(async item => {
        return await validate<GridItemDTO>(item, GridItemDTO, true)
      }),
    )) as GridItem[]

    items.forEach(item => {
      item.gridId = id
    })

    this.itemRepository.delete({ gridId: id })
    this.itemRepository.insert(items)
  }

  async update(id: number, dto: ImportGridDTO): Promise<Grid> {
    const gridFormated = await validate<GridUpdateDTO>(
      dto,
      GridUpdateDTO,
      true,
      ['UPDATE'],
    )
    this.updateItems(id, dto)

    await this.repository.update(id, gridFormated)
    return await this.repository.findOne(id)
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id)
  }
}
