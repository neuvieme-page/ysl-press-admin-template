import { AdminEntity } from 'nestjs-admin'
import { Media } from './media.entity'

export class MediaAdmin extends AdminEntity {
  entity = Media
  searchFields = ['id', 'name', 'type', 'url', 'width', 'height']
  listDisplay = [
    'id',
    'name',
    'type',
    'url',
    'width',
    'height',
    'originId',
    'thumbnailId',
  ]
}
