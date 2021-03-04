import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Exclude, Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

@Exclude()
export class GridItemDTO {
  @IsNotEmpty()
  @IsNumber()
  @Expose()
  @ApiProperty()
  col: number

  @IsNotEmpty()
  @IsNumber()
  @Expose()
  @ApiProperty()
  row: number

  @IsNotEmpty()
  @IsNumber()
  @Expose()
  @ApiProperty()
  width: number

  @IsNotEmpty()
  @IsNumber()
  @Expose()
  @ApiProperty()
  height: number

  @IsOptional()
  @IsNumber()
  @Expose()
  @ApiProperty()
  mediaId: number | null
}

@Exclude()
export class ExportGridItemDTO {
  @Expose()
  col: number

  @Expose()
  row: number

  @Expose()
  width: number

  @Expose()
  height: number

  @Expose()
  mediaId: number | null
}
