import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'
import { Grid } from './grid.entity'

@EventSubscriber()
export class GridSubscriber implements EntitySubscriberInterface<Grid> {
  constructor(connection: Connection) {
    connection.subscribers.push(this)
  }

  listenTo() {
    return Grid
  }

  beforeUpdate(event: UpdateEvent<Grid>) {
    event.entity.updatedAt = new Date()
  }

  beforeInsert(event: InsertEvent<Grid>) {
    event.entity.createdAt = new Date()
    event.entity.updatedAt = new Date()
  }
}
