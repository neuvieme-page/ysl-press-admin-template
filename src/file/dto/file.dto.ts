import { IsNotEmpty } from 'class-validator'

export class FileIdDTO {
  @IsNotEmpty()
  id: number
}
