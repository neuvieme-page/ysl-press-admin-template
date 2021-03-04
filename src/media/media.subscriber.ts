import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'
import { Media } from './media.entity'

@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface<Media> {
  constructor(connection: Connection) {
    connection.subscribers.push(this)
  }

  listenTo() {
    return Media
  }

  beforeUpdate(event: UpdateEvent<Media>) {
    event.entity.updatedAt = new Date()
  }

  beforeInsert(event: InsertEvent<Media>) {
    event.entity.createdAt = new Date()
    event.entity.updatedAt = new Date()
  }
}
