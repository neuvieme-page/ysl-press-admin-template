import { Controller, Get, Request, UseGuards, Post, Body, Delete, Param, NotFoundException, Patch } from '@nestjs/common'
import { AuthJwtGuard } from '../auth/jwt/jwt.guard'
import { User } from './user.entity'
import { LocalSignupDTO } from '../auth/local/dto/local.signup.dto'
import { actionLog } from '../helpers/log'
import { HttpSuccessResponse } from '../helpers/success.http'

import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody
} from '@nestjs/swagger'
import { UsersService } from './users.service'

@ApiBearerAuth()
@ApiTags('users')
@Controller()
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthJwtGuard)
  @Get('users')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: User, status: 200, description: 'The found record' })
  async findAll(): Promise<User[]> {
    actionLog({ title: 'UserController', description: `Find all users`, indentation: 0 })
    return this.usersService.findAll()
  }

  @UseGuards(AuthJwtGuard)
  @ApiResponse({ status: 200, description: 'The registered user.' })
  @ApiBody({ type: LocalSignupDTO })
  @Post('users')
  async signUp(@Body() dto: LocalSignupDTO): Promise<User> {
    actionLog({ title: 'UserController', description: `Create a new user`, indentation: 0 })
    return this.usersService.create(dto)
  }

  @UseGuards(AuthJwtGuard)
  @ApiResponse({ status: 200, description: 'The registered user.' })
  @ApiBody({ type: LocalSignupDTO })
  @Delete('users/:id')
  async delete(@Param('id') id: number): Promise<HttpSuccessResponse> {
    actionLog({ title: 'UserController', description: `Delete user with id ${id}`, indentation: 0 })
    if (!(await this.usersService.findOne(id))) throw new NotFoundException()
    await this.usersService.delete(id)
    if (!(await this.usersService.findOne(id)))
      return new HttpSuccessResponse('Record successfully deleted')
  }

  @UseGuards(AuthJwtGuard)
  @ApiResponse({ status: 200, description: 'The registered user.' })
  @ApiBody({ type: LocalSignupDTO })
  @Patch('users/:id')
  async update(@Param('id') id: number, @Body() dto: LocalSignupDTO): Promise<User> {
    actionLog({ title: 'UserController', description: `Update user with id ${id}`, indentation: 0 })
    return await this.usersService.update(id, dto)
  }

  @UseGuards(AuthJwtGuard)
  @Get('users/me')
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: User, status: 200, description: 'The found record' })
  async me(@Request() req): Promise<User> {
    return req.user
  }
}
