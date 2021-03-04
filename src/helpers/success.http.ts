export class HttpSuccessResponse {
  statusCode: number
  message: string

  constructor(message) {
    this.statusCode = 200
    this.message = message
  }
}
