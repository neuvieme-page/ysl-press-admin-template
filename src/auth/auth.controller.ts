import { Controller, Post, UseGuards, Get, Body } from '@nestjs/common'
import { AuthLocalService } from './local/local.service'
import { LocalSignupDTO } from './local/dto/local.signup.dto'
import { LocalSigninDTO } from './local/dto/local.signin.dto'
import { BearerResponse } from './interfaces/BearerResponse'
import { AuthJwtGuard } from './jwt/jwt.guard'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('authentication')
@Controller()
export class AuthController {
  constructor(private readonly authLocalService: AuthLocalService) {}

  @ApiOperation({ summary: 'Logout the current user' })
  @UseGuards(AuthJwtGuard)
  @Get('auth/logout')
  async logout(): Promise<string> {
    return 'ok'
  }

  @ApiOperation({ summary: 'Just check auth' })
  @UseGuards(AuthJwtGuard)
  @Get('auth/check')
  async check(): Promise<string> {
    return 'ok'
  }

  @ApiOperation({
    summary: 'Signin the current user using local authentication',
  })
  @ApiResponse({ status: 200, description: 'The bearer access token.' })
  @ApiBody({ type: LocalSigninDTO })
  @Post('auth/local/sign_in')
  async login(@Body() dto: LocalSigninDTO): Promise<BearerResponse> {
    return this.authLocalService.signIn(dto)
  }
}
