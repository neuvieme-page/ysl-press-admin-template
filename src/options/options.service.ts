import { Injectable } from '@nestjs/common'
import { Option } from './options.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import validate from '../helpers/validate'
import { ConfigurationDTO } from './dto/options.dto'

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Option)
    private repository: Repository<Option>,
  ) {}

  async findItem(key: string) {
    return await this.repository.findOne({ key })
  }

  async findItemOrCreate(key: string) {
    let item = await this.findItem(key)
    if (!item) {
      item = await this.updateItem(key, '');
    }
    return item;
  }

  async updateItem(key: string, value: string) {
    let item = await this.repository.findOne({ key })
    if (!item) {
      item = new Option()
      item.key = key
    }
    item.value = value;
    return await this.repository.save(item);
  }

  async updateConfiguration(dto: ConfigurationDTO): Promise<ConfigurationDTO> {
    const configurationDTO = await validate<ConfigurationDTO>(dto, ConfigurationDTO, true, ['UPDATE'])

    await Promise.all(Object.keys(configurationDTO).map(async (key) => {
      await this.updateItem(key, configurationDTO[key])
    }))

    return await this.getConfiguration();
  }

  async getConfiguration() {
    return await validate<ConfigurationDTO>({
      siteName: (await this.findItemOrCreate('siteName')).value,
      legalNotice: (await this.findItemOrCreate('legalNotice')).value,
    })
  }
}
