import { IsString } from 'class-validator'

export class ConfigurationDTO {
  @IsString()
  siteName: string
  
  @IsString()
  legalNotice: string
}