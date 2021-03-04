import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ClickItemBehaviour } from '../group.entity'

export class BaseGroupDTO {
  @IsNotEmpty()
  @IsOptional({ groups: ['UPDATE'] })
  name: string

  @IsString()
  @IsOptional()
  description: string

  @IsNumber()
  @IsOptional()
  rank: number
}

export class GroupDTO extends BaseGroupDTO {
  @IsNotEmpty()
  id: number
}

export class GroupIdDTO {
  @IsNotEmpty()
  @ApiProperty()
  id: number
}

export class ImportGroupDTO {
  @IsNotEmpty()
  @IsOptional({ groups: ['UPDATE'] })
  name: string

  @IsString()
  @IsOptional()
  description: string

  @IsString()
  @IsOptional()
  rank: number

  @IsString()
  @IsOptional()
  popinColumnsCount: number
  
  @IsString()
  @IsOptional()
  clickItemBehaviour: ClickItemBehaviour
}

export class ImportJoinGroupDTO {
  @IsNotEmpty()
  id: number
}
