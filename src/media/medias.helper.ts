import {
  MediaImageDTO,
  ImportMediaDTO,
  MediaYoutubeDTO,
  MediaVideoDTO,
} from './dto/media.dto'
import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common'
import { FilesService } from '../file/files.service'
import { File } from 'multer'
import { ImageService } from './image.service'
import { MediaType } from './media.entity'
import { VideoService } from './video.service'
import { successLog } from '../helpers/log'


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

  async handleMedia(file: File, params: ImportMediaDTO) {
    const fileType = params.type
      ? params.type
      : file.mimetype.match(/[a-z]*(?=[/])/g)[0]

    switch (fileType) {
      case 'image':
        return await this.mediaImageEntity(file, params)
      case 'video':
        return await this.mediaVideoEntity(file, params)
      case 'youtube':
        return await this.mediaYoutubeEntity(file, params)
      default:
        throw new UnsupportedMediaTypeException()
    }
  }

  async mediaYoutubeEntity(
    file: File,
    { url, name },
  ): Promise<MediaYoutubeDTO> {
    const fileEntity = await this.fileService.create(file)

    return {
      name,
      url,
      origin: fileEntity,
      type: MediaType.Youtube,
      width: 3,
      height: 6,
    }
  }

  async mediaImageEntity(file: File, { name }): Promise<MediaImageDTO> {
    const thumbnailEntity = await this.imageService.generateThumbnail(file)
    successLog({ title: 'MediaHelper', description: `Finish generate thumbnail for image ${file.originalname}` })
    const fileEntity = await this.fileService.create(file)

    const fileSource = __dirname + '/../../tmp/' + file.originalname
    const dimensions = sizeOf(fileSource)
    const ratio = dimensions.width / dimensions.height

    return {
      name,
      origin: fileEntity,
      type: MediaType.Image,
      thumbnail: thumbnailEntity,
      width: 1,
      height: ratio > 1 ? 2 : 5,
    }
  }

  async mediaVideoEntity(file: File, { name }): Promise<MediaVideoDTO> {
    const thumbnailEntity = await this.videoService.generateThumbnail(file)
    successLog({ title: 'MediaHelper', description: `Finish generate thumbnail for video ${file.originalname}` })
    const fileEntity = await this.fileService.create(file)
    const fileSource = __dirname + '/../../tmp/' + file.originalname
    const fileMetaData = await ffprobe(fileSource, {
      path: ffprobeStatic.path,
    })
    const ratio = fileMetaData.streams[0]
      ? fileMetaData.streams[0].width / fileMetaData.streams[0].height
      : 1

    return {
      name,
      origin: fileEntity,
      type: MediaType.Video,
      thumbnail: thumbnailEntity,
      height: ratio > 1 ? 2 : 5,
      width: 1,
    }
  }
}
