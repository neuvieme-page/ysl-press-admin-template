import * as tmp from 'tmp'

class TmpService {
  cleanupCallback: Function
  path: string

  constructor() {
    this.openDir()
  }

  openDir() {
    tmp.dir((err, path, cleanupCallback) => {
      if (err) throw err
      this.path = path
      this.cleanupCallback = cleanupCallback
    })
  }

  closeDir() {
    this.cleanupCallback()
  }
}

const tmpService = new TmpService()
export { tmpService }
