import { AdminEntity } from 'nestjs-admin'
import { File } from './file.entity'

export class FileAdmin extends AdminEntity {
  entity = File
  searchFields = ['id', 'name', 'url', 'mimetype', 'size', 'createdAt']
  listDisplay = ['id', 'name', 'url', 'mimetype', 'size', 'createdAt']
}
