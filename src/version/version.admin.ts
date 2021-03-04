import { AdminEntity } from 'nestjs-admin'
import { Version } from './version.entity'

export class VersionAdmin extends AdminEntity {
  entity = Version
  searchFields = ['id', 'name', 'canDownload', 'password', 'startAt', 'endAt']
  listDisplay = [
    'id',
    'name',
    'canDownload',
    'password',
    'gridDesktopId',
    'gridMobileId',
    'startAt',
    'endAt',
    'updatedAt',
  ]
}
