import { AdminEntity } from 'nestjs-admin'
import { Grid } from './grid.entity'

export class GridAdmin extends AdminEntity {
  entity = Grid
  searchFields = ['id', 'width']
  listDisplay = ['id', 'width']
}
