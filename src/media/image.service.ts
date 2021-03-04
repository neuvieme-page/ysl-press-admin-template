import { Injectable } from '@nestjs/common'
import { File } from 'multer'
import { FilesService } from '../file/files.service'
import { actionLog, errorLog, successLog } from '../helpers/log'

// eslint-disable-next-line
const sharp = require('sharp')

// eslint-disable-next-line
const sizeOf = require('image-size')

@Injectable()
export class ImageService {
  constructor(private readonly fileService: FilesService) {}
  async generateThumbnail(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      actionLog({ title: 'ImageService', description: "Start generate thumbnail" })
      const fileSource = __dirname + '/../../tmp/' + file.originalname
      const dimensions = sizeOf(fileSource)
      const ratio = dimensions.width / dimensions.height
      const width = ratio > 1 ? 1200 : 857
      const height = ratio > 1 ? 675 : 1200
      sharp(fileSource)
        .resize(width, height)
        .jpeg({
          quality: 80,
        })
        .toFile(`${__dirname}/../../tmp/min-${file.originalname}`, err => {
          successLog({ title: 'ImageService', description: "Sucessfully resize image", extended: `min-${file.originalname}, ${width}x${height}` })
          if (err) reject(err)
          else {
            const output = { ...file }
            output.originalname = `min-${file.originalname}`
            this.fileService
              .create(output, true)
              .then(file => {
                resolve(file)
              })
              .catch(error => {
                errorLog({ title: 'ImageService', description: error })
                reject(error)
              })
          } 
        })
    })
  }
}
