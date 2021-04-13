import {
  MediaImageDTO,
  ImportMediaDTO,
  MediaYoutubeDTO,
  MediaVideoDTO,
  MediaFilesDTO,
} from './dto/media.dto'
import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common'
import { FilesService } from '../file/files.service'
import { File } from 'multer'
import { ImageService } from './image.service'
import { MediaType } from './media.entity'
import { VideoService } from './video.service'
import { successLog } from '../helpers/log'
import { BadRequestException } from '@nestjs/common'


// eslint-disable-next-line
const ffprobe = require('ffprobe')
// eslint-disable-next-line
const ffprobeStatic = require('ffprobe-static')
// eslint-disable-next-line
const sizeOf = require('image-size')

@Injectable()
export class MediasHelper {
  constructor(
    private readonly fileService: FilesService,
    private readonly imageService: ImageService,
    private readonly videoService: VideoService
  ) {}

  async handleMedia({originFile, popinFile = null, gridFile = null}: MediaFilesDTO, params: ImportMediaDTO) {
    originFile = originFile && originFile[0]
    popinFile = popinFile && popinFile[0]
    gridFile = gridFile && gridFile[0]

    const fileType = params.type
      ? params.type
      : originFile.mimetype.match(/[a-z]*(?=[/])/g)[0]


    switch (fileType) {
      case 'image':
        return await this.mediaImageEntity({ originFile, popinFile, gridFile }, params)
      case 'video':
        return await this.mediaVideoEntity({ originFile, popinFile, gridFile }, params)
      case 'youtube':
        return await this.mediaYoutubeEntity(originFile, params)
      default:
        throw new UnsupportedMediaTypeException()
    }
  }

  async handleFile(file: File) {
    return await this.fileService.create(file)
  }

  async mediaYoutubeEntity(
    file: File,
    { url, name },
  ): Promise<MediaYoutubeDTO> {
    const fileEntity = await this.fileService.create(file)

    return {
      name,
      url,
      originFile: fileEntity,
      type: MediaType.Youtube,
      width: 3,
      height: 6,
    }
  }

  async getRatio(file) {
    const type = file.mimetype.match(/[a-z]*(?=[/])/g)[0];
    if (type === 'image') {
      return this.getImageRatio(file)
    }
    if (type === 'video') {
      return await this.getVideoRatio(file)
    }
  }

  getImageRatio(file: File): number {
    const fileSource = __dirname + '/../../tmp/' + file.originalname
    const dimensions = sizeOf(fileSource)
    return dimensions.width / dimensions.height
  }

  async getVideoRatio(file: File): Promise<number> {
    const fileSource = __dirname + '/../../tmp/' + file.originalname
    const fileMetaData = await ffprobe(fileSource, {
      path: ffprobeStatic.path,
    })

    let ratio = 1;
    if (fileMetaData.streams) {
      const stream = fileMetaData.streams.find(stream => stream.codec_type === 'video')
      if (stream) {
        ratio = stream.width / stream.height
      }
    }

    return ratio
  }

  async mediaImageEntity({ originFile, gridFile, popinFile }: MediaFilesDTO, { name }): Promise<MediaImageDTO> {
    // If handle thumbnail is needed
    let thumbnailEntity = null;
    if (!gridFile || !popinFile) {
      successLog({ title: 'MediaHelper', description: `Finish generate thumbnail for image ${originFile.originalname}` })
      thumbnailEntity = await this.imageService.generateThumbnail(originFile)
    }

    successLog({ title: 'MediaHelper', description: `Finish generate gridFile entity` })
    const gridFileEntity = !gridFile && thumbnailEntity ? thumbnailEntity : await this.handleFile(gridFile)
    
    successLog({ title: 'MediaHelper', description: `Finish generate popinFile entity` })
    const popinFileEntity = !popinFile && thumbnailEntity ? thumbnailEntity : await this.handleFile(popinFile)

    const fileEntity = await this.fileService.create(originFile)
    const ratio = await this.getRatio(gridFile || originFile)

    return {
      name,
      originFile: fileEntity,
      gridFile: gridFileEntity,
      popinFile: popinFileEntity,
      type: MediaType.Image,
      width: 1,
      height: ratio > 1 ? 2 : 5,
    }
  }

  async mediaVideoEntity({ originFile, gridFile, popinFile }: MediaFilesDTO, { name }): Promise<MediaVideoDTO> {
    // If handle thumbnail is needed
    let thumbnailEntity = null;
    if (!gridFile || !popinFile) {
      thumbnailEntity = await this.videoService.generateThumbnail(originFile).catch(() => {
        throw new BadRequestException("Une des vidéos téléchargées dépasse la taille limite (60Mo)")
      })
      successLog({ title: 'MediaHelper', description: `Finish generate thumbnail for video ${originFile.originalname}` })
    }

    successLog({ title: 'MediaHelper', description: `Finish generate gridFile entity` })
    const gridFileEntity = !gridFile && thumbnailEntity ? thumbnailEntity : this.handleFile(gridFile)
    
    successLog({ title: 'MediaHelper', description: `Finish generate popinFile entity` })
    const popinFileEntity = !popinFile && thumbnailEntity ? thumbnailEntity : this.handleFile(popinFile)

    const fileEntity = await this.fileService.create(originFile)
    const ratio = await this.getRatio(gridFile || originFile)

    return {
      name,
      originFile: fileEntity,
      gridFile: gridFileEntity,
      popinFile: popinFileEntity,
      type: MediaType.Video,
      height: ratio > 1 ? 2 : 5,
      width: 1,
    }
  }
}
