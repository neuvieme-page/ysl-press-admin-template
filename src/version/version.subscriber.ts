import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'
import { Version } from './version.entity'

@EventSubscriber()
export class VersionSubscriber implements EntitySubscriberInterface<Version> {
  constructor(connection: Connection) {
    connection.subscribers.push(this)
  }

  listenTo() {
    return Version
  }

  beforeUpdate(event: UpdateEvent<Version>) {
    event.entity.updatedAt = new Date()
  }

  beforeInsert(event: InsertEvent<Version>) {
    event.entity.createdAt = new Date()
    event.entity.updatedAt = new Date()
  }
}
