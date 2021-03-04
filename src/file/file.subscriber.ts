import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'
import { File } from './file.entity'

@EventSubscriber()
export class FileSubscriber implements EntitySubscriberInterface<File> {
  constructor(connection: Connection) {
    connection.subscribers.push(this)
  }

  listenTo() {
    return File
  }

  beforeInsert(event: InsertEvent<File>) {
    event.entity.createdAt = new Date()
  }
}
