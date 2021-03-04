import {
  IsBoolean,
  isNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator'
import { File } from '../../file/file.entity'
import { Exclude, Type } from 'class-transformer'
import { GridUpdateDTO, ExportGridDTO } from '../../grid/dto/grid.dto'
import { ImportJoinGroupDTO, GroupDTO } from '../../group/dto/group.dto'
import { MediaType } from '../media.entity'
import { GroupIdDTO } from '../../group/dto/group.dto'
import { FileIdDTO } from '../../file/dto/file.dto'
import { ApiProperty } from '@nestjs/swagger'

export class ImportMediaDTO {
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @ValidateNested({ each: true })
  @ApiProperty({ type: [String] })
  groups: string[]

  @ValidateNested({ each: true })
  @IsOptional()
  @ApiProperty()
  url: string

  @IsOptional()
  @ApiProperty({ enum: MediaType })
  type: MediaType
}

export class PatchMediaDTO {
  @ApiProperty()
  name: string

  @ValidateNested({ each: true })
  @Type(() => GroupIdDTO)
  @ApiProperty({ type: [GroupIdDTO] })
  groups: GroupIdDTO[]
}

export class BaseMediaDTO {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  origin: File

  @IsNotEmpty()
  type: MediaType

  @IsNotEmpty()
  height: number

  @IsNotEmpty()
  width: number
}

export class MediaImageDTO extends BaseMediaDTO {
  @IsNotEmpty()
  thumbnail: File
}

export class MediaYoutubeDTO extends BaseMediaDTO {
  @IsNotEmpty()
  url: string
}

export class MediaVideoDTO extends BaseMediaDTO {
  @IsNotEmpty()
  thumbnail: File
}

export class ExportBaseMediaDTO {
  @IsNotEmpty()
  id: number

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  type: MediaType

  @IsNotEmpty()
  origin: File

  @IsNotEmpty()
  height: number

  @IsNotEmpty()
  width: number

  @ValidateNested({ each: true })
  @Type(() => GroupIdDTO)
  groups: GroupIdDTO[]
}
export class ExportMediaDTO {
  @Type(() => ExportGridDTO)
  @ValidateNested()
  gridDesktop: ExportGridDTO

  @Type(() => ExportGridDTO)
  @ValidateNested()
  gridMobile: ExportGridDTO

  @Exclude()
  gridMobileId: number

  @Exclude()
  gridDesktopId: number
}
