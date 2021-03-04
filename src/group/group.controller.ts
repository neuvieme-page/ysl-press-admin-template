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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthJwtGuard } from '../auth/jwt/jwt.guard'
import { Group } from './group.entity'
import { GroupsService } from './group.service'
import { ImportGroupDTO } from './dto/group.dto'
import { HttpSuccessResponse } from '../helpers/success.http'
import { FileInterceptor } from '@nestjs/platform-express'
import { File, diskStorage } from 'multer'
import { actionLog } from '../helpers/log'

const fileInterceptor = {
  storage: diskStorage({
    destination: './tmp',
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    },
  }),
}

@ApiBearerAuth()
@ApiTags('groups')
@Controller()
export class GroupController {
  constructor(private readonly service: GroupsService) {}

  @UseGuards(AuthJwtGuard)
  @Get('groups')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({ type: [Group], status: 200, description: 'The records list.' })
  async findAll(): Promise<Group[]> {
    actionLog({ title: 'GroupController', description: "Find all groups", indentation: 0 })
    return this.service.findAll()
  }

  @UseGuards(AuthJwtGuard)
  @Get('groups/:id')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({
    type: Group,
    status: 200,
    description: 'Return details information based on id.',
  })
  @ApiResponse({ type: Group, status: 404, description: 'Record not found' })
  async findOne(@Param('id') id: number): Promise<Group> {
    actionLog({ title: 'GroupController', description: `Find group with id "${id}"`, indentation: 0 })
    const group = await this.service.findOne(id)
    if (!group) throw new NotFoundException()
    return group
  }

  @UseGuards(AuthJwtGuard)
  @Post('groups')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: [Group], status: 200, description: 'The records list' })
  @ApiResponse({ type: [Group], status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file', fileInterceptor))
  async create(@Body() dto: ImportGroupDTO, @UploadedFile() file: File) {
    actionLog({ title: 'GroupController', description: `Create new group`, indentation: 0 })
    return this.service.create(dto, file)
  }

  @UseGuards(AuthJwtGuard)
  @Patch('groups/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: Group, status: 200, description: 'The updated record' })
  @ApiResponse({ type: Group, status: 404, description: 'Record not found' })
  @UseInterceptors(FileInterceptor('file', fileInterceptor))
  async update(
    @Param('id') id: number,
    @Body() dto: ImportGroupDTO,
    @UploadedFile() file: File,
  ) {
    actionLog({ title: 'GroupController', description: `Update group with id "${id}"`, indentation: 0 })
    if (!(await this.service.findOne(id))) throw new NotFoundException()
    return this.service.update(id, dto, file)
  }

  @UseGuards(AuthJwtGuard)
  @Delete('groups/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: Group, status: 200, description: 'The updated record' })
  @ApiResponse({ type: Group, status: 404, description: 'Record not found' })
  async delete(@Param('id') id: number): Promise<HttpSuccessResponse> {
    actionLog({ title: 'GroupController', description: `Delete group with id "${id}"`, indentation: 0 })
    if (!(await this.service.findOne(id))) throw new NotFoundException()
    await this.service.delete(id)
    if (!(await this.service.findOne(id)))
      return new HttpSuccessResponse('Record successfully deleted')
    throw new InternalServerErrorException(id, 'Cannot delete this post')
  }
}
