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
  InternalServerErrorException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'
import {} from '@nestjs/common'
import { AuthJwtGuard } from '../auth/jwt/jwt.guard'
import { Version } from './version.entity'
import { VersionsService } from './versions.service'
import { ImportVersionDTO, ExportVersionDTO } from './dto/version.dto'
import { HttpSuccessResponse } from '../helpers/success.http'
import { ValidationPipe } from '../helpers/validation.pipe'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
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
@ApiTags('versions')
@Controller()
export class VersionController {
  constructor(private readonly versionsService: VersionsService) {}

  @UseGuards(AuthJwtGuard)
  @Get('versions')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({
    type: [Version],
    status: 200,
    description: 'The records list.',
  })
  async findAll(): Promise<Version[]> {
    actionLog({ title: 'VersionController', description: `Find all versions`, indentation: 0 })
    return this.versionsService.findAll()
  }

  @UseGuards(AuthJwtGuard)
  @Post('versions/:id/attachment')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: Version, status: 200, description: 'The updated record' })
  @UseInterceptors(
    FileFieldsInterceptor([{name: 'archive', maxCount: 1}, { name: 'pressRelease', maxCount: 1}], fileInterceptor)
  )
  async attachment(
    @Param('id') id: number,
    @UploadedFiles() files,
  ) {
    actionLog({ title: 'VersionController', description: `Update attachments for version "${id}"`, indentation: 0 })
    if (!files) throw new BadRequestException(id, "Need to pass at least one of these parameter: [archive, pressRelease] ")
    if (!(await this.versionsService.findOne(id))) throw new NotFoundException()
    return this.versionsService.updateAttachment(id, files)
  }

  @Get('versions/auth')
  @ApiResponse({
    type: Version,
    status: 200,
    description: 'Return details information based on password',
  })
  @ApiResponse({ type: Version, status: 404, description: 'Record not found' })
  async findOneByAuth(
    @Query('password') password: string,
  ): Promise<ExportVersionDTO> {
    const version = await this.versionsService.findOneByAuth(password)
    return version
  }

  @UseGuards(AuthJwtGuard)
  @Get('versions/:id')
  @ApiHeader({
    name: 'Bearer',
    description: 'Admin bearer token for authentication',
  })
  @ApiResponse({
    type: Version,
    status: 200,
    description: 'Return details information based on id.',
  })
  @ApiResponse({ type: Version, status: 404, description: 'Record not found' })
  async findOne(@Param('id') id: number): Promise<ExportVersionDTO> {
    actionLog({ title: 'VersionController', description: `Find version with id "${id}"`, indentation: 0 })
    const version = await this.versionsService.findOne(id)
    if (!version) throw new NotFoundException()
    return version
  }

  @UseGuards(AuthJwtGuard)
  @Post('versions')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({
    type: [Version],
    status: 200,
    description: 'The records list',
  })
  @ApiResponse({ type: [Version], status: 400, description: 'Bad request' })
  async create(
    @Body(new ValidationPipe()) dto: ImportVersionDTO,
  ): Promise<ExportVersionDTO> {
    actionLog({ title: 'VersionController', description: `Create new version`, indentation: 0 })
    return this.versionsService.create(dto)
  }

  @UseGuards(AuthJwtGuard)
  @Patch('versions/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({
    type: Version,
    status: 200,
    description: 'The updated record',
  })
  @ApiResponse({ type: Version, status: 404, description: 'Record not found' })
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) dto: ImportVersionDTO,
  ): Promise<ExportVersionDTO> {
    actionLog({ title: 'VersionController', description: `Update version with id ${id}`, indentation: 0 })
    if (!(await this.versionsService.findOne(id))) throw new NotFoundException()
    return this.versionsService.update(id, dto)
  }

  @UseGuards(AuthJwtGuard)
  @Delete('versions/:id')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({
    type: Version,
    status: 200,
    description: 'The updated record',
  })
  @ApiResponse({ type: Version, status: 404, description: 'Record not found' })
  async delete(@Param('id') id: number): Promise<HttpSuccessResponse> {
    actionLog({ title: 'VersionController', description: `Delete version with id ${id}`, indentation: 0 })
    if (!(await this.versionsService.findOne(id))) throw new NotFoundException()
    await this.versionsService.delete(id)
    if (!(await this.versionsService.findOne(id)))
      return new HttpSuccessResponse('Record successfully deleted')
    throw new InternalServerErrorException(id, 'Cannot delete this post')
  }
}
