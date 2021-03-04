import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsDateString,
} from 'class-validator'
import { Exclude, Type } from 'class-transformer'
import { ExportGridDTO } from '../../grid/dto/grid.dto'

export class ExportVersionDTO {
  @Type(() => ExportGridDTO)
  @ValidateNested()
  gridDesktop: ExportGridDTO

  @Type(() => ExportGridDTO)
  @ValidateNested()
  gridMobile: ExportGridDTO

  startAt: Date
  endAt: Date

  @Exclude()
  gridMobileId: number

  @Exclude()
  gridDesktopId: number
}
