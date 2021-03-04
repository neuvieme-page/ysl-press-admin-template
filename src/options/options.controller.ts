import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiResponse } from '@nestjs/swagger'
import { OptionsService } from './options.service'
import { ConfigurationDTO } from './dto/options.dto'
import { AuthJwtGuard } from '../auth/jwt/jwt.guard'

@Controller()
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @UseGuards(AuthJwtGuard)
  @ApiHeader({ name: 'Bearer', description: 'Token for authentication' })
  @ApiResponse({ type: ConfigurationDTO, status: 200, description: 'The website configuration' })
  @Post('configurations')
  async updateConfiguration(@Body() dto: ConfigurationDTO) {
    return this.optionsService.updateConfiguration(dto)
  }

  @ApiResponse({ type: ConfigurationDTO, status: 200, description: 'The website configuration' })
  @Get('configurations')
  async getConfiguration() {
    return this.optionsService.getConfiguration()
  }
}
