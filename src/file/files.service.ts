import { BadRequestException, Injectable } from '@nestjs/common'
import { File } from './file.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Storage } from '@google-cloud/storage'
import { configService } from '../config/config.service'
import { actionLog, errorLog, successLog, log} from '../helpers/log'

const storage = new Storage({ keyFilename: 'gcloud-auth.json' })
// eslint-disable-next-line
const fs = require('fs')

// eslint-disable-next-line
const util = require('util')
const rename = util.promisify(fs.rename)

const bucket = storage.bucket(configService.get('GCLOUD_STORAGE_BUCKET'))

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly repository: Repository<File>,
  ) {}

  async create(file, synchronous = false, deleteTmp = true): Promise<File> {
    if (!file) {
      throw new Error('FileService: File is not defined')
    }

    actionLog({ title: 'FileService', description: 'Start file creation' })

    const path = __dirname + '/../../tmp'
    let i = 0
    // check for doublons
    while (
      await this.repository.findOne({
        where: {
          name: i === 0 ? file.originalname : `${i}-${file.originalname}`,
        },
      })
    ) {
      i++
    }

    const originalName = file.originalname
    const finalName = i ? `${i}-${file.originalname}` : originalName
    //rename file
    if (i) {
      actionLog({ title: 'FileService', description: 'Duplicate name was found', extended: `${originalName} is renamed to ${finalName}` })
      await rename(
        `${path}/${originalName}`,
        `${path}/${finalName}`,
      )
      file.originalname = finalName
    }

    let entity = this.repository.create({
      url: '',
      size: file.size,
      mimetype: file.mimetype,
      name: file.originalname,
    })

    entity = await this.repository.save(entity) as File
    if (!entity) throw new Error('FileService: Cannot process file entity')
    successLog({ title: 'FileService', description: `File entity successfully created with id "${entity.id}"` })

    return new Promise((resolve, reject) => {
      bucket
        .upload(`${path}/${finalName}`, {
          onUploadProgress: event => {
            log({ title: 'Progress', description: event.bytesWritten })
          }
        })
        .then(async res => {
          const url = res[1].mediaLink
          let fileEntity = await this.repository.findOne(entity.id)
          fileEntity.url = url
          fileEntity = await this.repository.save(fileEntity)
          successLog({ title: 'FileService', description: `File successfully uploaded to CDN, url upaded in file "${entity.id}"` })

          if (deleteTmp) {
            await this.rmFile(`${path}/${finalName}`)
          }
          
          if (synchronous) {
            resolve(fileEntity)
          }
        })
        .catch(error => {
          errorLog({ title: 'FileService', description: error })
          this.delete(entity.id)
          if (configService.get('GCLOUD_ENABLE')) {
            return error
          }
          reject(error)
        })
        
      if (!synchronous) {
        resolve(entity)
      }
    })
  }

  /**
   * @todo Handle GCP delete
   */
  async delete(id: number) {
    const file = await this.repository.findOne(id)
    if (!configService.get('GCLOUD_ENABLE')) {
      const success = await this.rmFile(`../../tmp/${file.url}`)
      this.repository.delete(id)
    } else {
      try {
        const a = await bucket.file(file.name).delete()
        this.repository.delete(id)
        successLog({ title: 'FileService', description: `File successfully deleted with id "${id}"` })
        return 'ok'
      } catch (e) {
        console.warn('error during deletion', e)
        errorLog({ title: 'FileService', description: `Error during deletion of file "${id}"`, extended: e })
        throw new BadRequestException("can't delete on gcp")
      }
    }
  }

  async rmFile(path) {
    return new Promise(resolve => {
      fs.stat(path, function(err) {
        if (err) {
          errorLog({ title: 'FileService', description: `Local file cannot be deleted with path "${path}"`, extended: err })
          resolve(false)
          return console.error(err)
        }

        fs.unlink(path, err => {
          if (err) {
            errorLog({ title: 'FileService', description: `Local file cannot be deleted with path "${path}"`, extended: err })
            resolve(false)
            return console.log(err)
          }
          resolve(true)
          actionLog({ title: 'FileService', description: `Local file deleted with path "${path}"` })
        })
      })
    })
  }
}
