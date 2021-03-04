import { IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator'
import { Exclude, Type, Expose } from 'class-transformer'
import { GridItemDTO, ExportGridItemDTO } from './grid_item.dto'
import { ApiProperty } from '@nestjs/swagger'

export class GridUpdateDTO {
  @IsOptional()
  @IsNumber()
  width: number

  @Exclude()
  @ApiProperty({ type: [GridItemDTO] })
  items: Array<GridItemDTO>
}

export class GridDTO {
  @IsOptional()
  @IsNumber()
  width: number

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => GridItemDTO)
  items: Array<GridItemDTO>
}

export class ImportGridDTO {
  @IsOptional()
  @IsNumber()
  width: number

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => GridItemDTO)
  @ApiProperty()
  items: Array<GridItemDTO>
}

@Exclude()
export class ExportGridDTO {
  @Expose()
  width: number

  @ValidateNested({ each: true })
  @Type(() => ExportGridItemDTO)
  @Expose()
  items: ExportGridItemDTO[]
}
