import { AdminEntity } from 'nestjs-admin'
import { Group } from './group.entity'

export class GroupAdmin extends AdminEntity {
  entity = Group
  searchFields = ['id', 'name', 'description']
  listDisplay = ['id', 'name', 'description', 'createdAt', 'updatedAt']
}
