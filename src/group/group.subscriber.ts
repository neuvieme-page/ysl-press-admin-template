import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'
import { Group } from './group.entity'

@EventSubscriber()
export class GroupSubscriber implements EntitySubscriberInterface<Group> {
  constructor(connection: Connection) {
    connection.subscribers.push(this)
  }

  listenTo() {
    return Group
  }

  beforeUpdate(event: UpdateEvent<Group>) {
    event.entity.updatedAt = new Date()
  }

  beforeInsert(event: InsertEvent<Group>) {
    event.entity.createdAt = new Date()
    event.entity.updatedAt = new Date()
  }
}
