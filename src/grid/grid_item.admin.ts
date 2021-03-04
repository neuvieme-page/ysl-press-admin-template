import { AdminEntity } from 'nestjs-admin'
import { GridItem } from './grid_item.entity'

export class GridItemAdmin extends AdminEntity {
  entity = GridItem
  searchFields = ['id', 'gridId', 'mediaId']
  listDisplay = ['id', 'gridId', 'col', 'row', 'width', 'height', 'mediaId']
}
