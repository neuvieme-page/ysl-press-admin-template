import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  Body,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthJwtGuard } from '../auth/jwt/jwt.guard'
import { Grid } from './grid.entity'
import { GridsService } from './grid.service'
import { GridUpdateDTO } from './dto/grid.dto'
import { HttpSuccessResponse } from '../helpers/success.http'

@ApiBearerAuth()
@ApiTags('grids')
@Controller()
export class GridController {
  constructor(private readonly service: GridsService) {}

  @UseGuards(AuthJwtGuard)
  @Get('grids')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({ type: [Grid], status: 200, description: 'The records list.' })
  async findAll(): Promise<Grid[]> {
    return this.service.findAll()
  }

  @UseGuards(AuthJwtGuard)
  @Get('grids/:id')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({
    type: Grid,
    status: 200,
    description: 'Return details information based on id.',
  })
  @ApiResponse({ type: Grid, status: 404, description: 'Record not found' })
  async findOne(@Param('id') id: number): Promise<Grid> {
    const grid = this.service.findOne(id)
    if (!grid) throw new NotFoundException()
    return grid
  }

  @UseGuards(AuthJwtGuard)
  @Post('grids')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: [Grid], status: 200, description: 'The records list' })
  @ApiResponse({ type: [Grid], status: 400, description: 'Bad request' })
  async create(@Body() dto: GridUpdateDTO) {
    return this.service.create(dto)
  }

  @UseGuards(AuthJwtGuard)
  @Patch('grids/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: Grid, status: 200, description: 'The updated record' })
  @ApiResponse({ type: Grid, status: 404, description: 'Record not found' })
  async update(@Param('id') id: number, @Body() dto: GridUpdateDTO) {
    if (!(await this.service.findOne(id))) throw new NotFoundException()
    return this.service.update(id, dto)
  }

  @UseGuards(AuthJwtGuard)
  @Delete('grids/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: Grid, status: 200, description: 'The updated record' })
  @ApiResponse({ type: Grid, status: 404, description: 'Record not found' })
  async delete(@Param('id') id: number): Promise<HttpSuccessResponse> {
    if (!(await this.service.findOne(id))) throw new NotFoundException()
    await this.service.delete(id)
    if (!(await this.service.findOne(id)))
      return new HttpSuccessResponse('Record successfully deleted')
    throw new InternalServerErrorException(id, 'Cannot delete this post')
  }
}
