import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { AuthJwtGuard } from '../auth/jwt/jwt.guard'
import { Media } from './media.entity'
import { MediasService } from './medias.service'
import {
  ImportMediaDTO,
  ExportBaseMediaDTO,
  PatchMediaDTO,
} from './dto/media.dto'
import { diskStorage } from 'multer'
import { actionLog, errorLog } from '../helpers/log'

const fileInterceptor = {
  storage: diskStorage({
    destination: './tmp',
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    },
  }),
}

@ApiBearerAuth()
@ApiTags('medias')
@Controller()
export class MediaController {
  constructor(private readonly mediasService: MediasService) {}

  @UseGuards(AuthJwtGuard)
  @Get('medias')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({ type: [Media], status: 200, description: 'The records list.' })
  async findAll(): Promise<Media[]> {
    actionLog({ title: 'MediasController', description: "Find all medias", indentation: 0 })
    return this.mediasService.findAll()
  }

  @Get('medias/auth')
  @ApiResponse({
    type: Media,
    status: 200,
    description: 'Return details information based on password',
  })
  @ApiResponse({ type: Media, status: 404, description: 'Record not found' })
  async findOneByAuth(@Query('password') password: string): Promise<any> {
    // const version = await this.mediasService.findAllByAuth(password)
    const version = await this.mediasService.findAll()
    // if (!version) throw new NotFoundException(); return version
    return version
  }

  @UseGuards(AuthJwtGuard)
  @Get('medias/:id')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({
    type: Media,
    status: 200,
    description: 'Return details information based on id.',
  })
  @ApiResponse({ type: Media, status: 404, description: 'Record not found' })
  async findOne(@Param('id') id: number): Promise<ExportBaseMediaDTO> {
    actionLog({ title: 'MediasController', description: `Find media with id "${id}"`, indentation: 0 })
    const media = await this.mediasService.findOne(id)
    if (!media) {
      errorLog({ title: 'MediasController', description: `Cannot found media with id "${id}"` })
      throw new NotFoundException()
    }
    return media
  }

  @UseGuards(AuthJwtGuard)
  @Post('medias/upload')
  @UseInterceptors(
    FileFieldsInterceptor([{name: 'originFile', maxCount: 1}, { name: 'gridFile', maxCount: 1}, { name: 'popinFile', maxCount: 1}], fileInterceptor)
  )
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: [Media], status: 200, description: 'The records list' })
  @ApiResponse({ type: [Media], status: 400, description: 'Bad request' })
  async upload(
    @Body() body: ImportMediaDTO,
    @UploadedFiles() files,
  ): Promise<ExportBaseMediaDTO> {
    actionLog({ title: 'MediasController', description: "Create media", indentation: 0 })
    return await this.mediasService.create(files, body)
  }

  @UseGuards(AuthJwtGuard)
  @Patch('medias/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: [Media], status: 200, description: 'The records list' })
  @ApiResponse({ type: [Media], status: 400, description: 'Bad request' })
  async patch(
    @Param('id') id,
    @Body() body: PatchMediaDTO,
  ): Promise<ExportBaseMediaDTO> {
    actionLog({ title: 'MediasController', description: `Update media with id "${id}"`, indentation: 0 })
    return await this.mediasService.update(id, body)
  }

  @UseGuards(AuthJwtGuard)
  @Delete('medias/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: [Media], status: 200, description: 'The records list' })
  @ApiResponse({ type: [Media], status: 400, description: 'Bad request' })
  async delete(@Param('id') id): Promise<boolean> {
    actionLog({ title: 'MediasController', description: `Update media with id "${id}"`, indentation: 0 })
    await this.mediasService.delete(id)
    return true
  }
}
