import { AdminEntity } from 'nestjs-admin'
import { Option } from './options.entity'

export class OptionAdmin extends AdminEntity {
  entity = Option
  searchFields = ['id', 'key', 'value']
  listDisplay = ['id', 'key', 'value']
}
