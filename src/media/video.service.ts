import { Injectable } from '@nestjs/common'
import { File } from 'multer'
import { FilesService } from '../file/files.service'
import { actionLog, errorLog, successLog } from '../helpers/log'

// eslint-disable-next-line
const { videoResize } = require('node-video-resize')
@Injectable()
export class VideoService {
  constructor(private readonly fileService: FilesService) {}
  async generateThumbnail(file: File): Promise<File> {
    return new Promise(async (resolve, reject) => {
      actionLog({ title: 'VideoService', description: "Start generate thumbnail" })
      const fileSource = __dirname + '/../../tmp/' + file.originalname
      const outputPath = `${__dirname}/../../tmp/min-${file.originalname}`
      await videoResize({
        inputPath: fileSource,
        outputPath: outputPath,
        format: 'mp4',
        size: '1280x?'
      }).catch((error) => {
        errorLog({ title: 'VideoService', description: error })
        reject(error)
      })

      successLog({ title: 'VideoService', description: "Sucessfully resize video", extended: `min-${file.originalname}` })

      const output = { ...file }
      output.originalname = 'min-' + file.originalname

      this.fileService
        .create(output, true)
        .then(file => {
          resolve(file)
        })
        .catch(error => {
          errorLog({ title: 'VideoService', description: error })
          reject(error)
        })
    })
  }
}
