import { BadRequestException, Type } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'

function toValidate(metatype: Function): boolean {
  const types: Function[] = [String, Boolean, Number, Array, Object]
  return !types.includes(metatype)
}

export default async <Base>(
  value: unknown,
  metatype?: Type<any>,
  transform: boolean = false,
  groups = [],
): Promise<Base> => {
  if (!metatype || !toValidate(metatype)) {
    return value as Base
  }

  const object = plainToClass(metatype, value, { groups })
  const errors = await validate(object)
  if (errors.length > 0) {
    throw new BadRequestException(errors, 'Validation failed')
  }

  if (transform) {
    return object as Base
  }
  return value as Base
}
