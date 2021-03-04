import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsDateString,
} from 'class-validator'
import { Exclude, Type } from 'class-transformer'
import { GridUpdateDTO, ExportGridDTO } from '../../grid/dto/grid.dto'
import { GroupIdDTO } from '../../group/dto/group.dto'
import { ApiProperty } from '@nestjs/swagger'

export class ImportVersionDTO {
  @IsString()
  @IsOptional({ groups: ['UPDATE'] })
  @IsNotEmpty({ groups: ['CREATE'] })
  @ApiProperty()
  name: string

  @IsBoolean()
  @IsNotEmpty({ groups: ['CREATE'] })
  @IsOptional({ groups: ['UPDATE'] })
  @ApiProperty()
  canDownload: boolean

  @IsNotEmpty({ groups: ['CREATE'] })
  @IsOptional({ groups: ['UPDATE'] })
  @IsString()
  @ApiProperty()
  password: string

  @ValidateNested({ each: true })
  @Type(() => GroupIdDTO)
  @ApiProperty({ type: [GroupIdDTO] })
  groups: GroupIdDTO[]

  @IsNotEmpty({ groups: ['CREATE'] })
  @IsOptional({ groups: ['UPDATE'] })
  @IsDateString()
  @ApiProperty()
  startAt: Date

  @IsNotEmpty({ groups: ['CREATE'] })
  @IsOptional({ groups: ['UPDATE'] })
  @IsDateString()
  @ApiProperty()
  endAt: Date

  @Exclude()
  @ApiProperty()
  gridDesktop: GridUpdateDTO | null

  @Exclude()
  @ApiProperty()
  gridMobile: GridUpdateDTO | null

  @Exclude()
  gridDesktopId: number

  @Exclude()
  gridMobileId: number

  @Exclude()
  createdAt: string

  @Exclude()
  updatedAt: string
}

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
