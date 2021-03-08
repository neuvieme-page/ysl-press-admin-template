import { Injectable } from '@nestjs/common'
import { File } from 'multer'
import { FilesService } from '../file/files.service'
import { actionLog, errorLog, successLog } from '../helpers/log'

const pipeStack: Promise<unknown>[] = [];
const pipe = async (callback: () => Promise<unknown>) => {
  const lastPromise = pipeStack[pipeStack.length - 1]
  const promise = new Promise(async (resolve) => {
    if(lastPromise) await lastPromise;
    await callback()
    pipeStack.splice(pipeStack.indexOf(promise), 1)
    resolve(true)
  })

  pipeStack.push(promise)
  return await promise
}

// eslint-disable-next-line
const { videoResize } = require('node-video-resize')
@Injectable()
export class VideoService {
  constructor(private readonly fileService: FilesService) {}
  async generateThumbnail(file: File): Promise<File> {
    return new Promise(async (resolve, reject) => {
      if (file.size > 60 * 10**6) {
        reject(new Error('Cannot generate thumbnail, size is to important'))
        return
      }

      actionLog({ title: 'VideoService', description: "Start generate thumbnail" })
      const fileSource = __dirname + '/../../tmp/' + file.originalname
      const outputPath = `${__dirname}/../../tmp/min-${file.originalname}`
      
      await pipe(async () => {
        await videoResize({
          inputPath: fileSource,
          outputPath: outputPath,
          format: 'mp4',
          size: '640x?'
        }).catch((error) => {
          errorLog({ title: 'VideoService', description: error })
          reject(error)
        })
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
