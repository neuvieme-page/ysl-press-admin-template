import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { User, UserRole } from './user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { LocalSignupDTO } from '../auth/local/dto/local.signup.dto'
import { encrypt } from '../auth/helpers/encryption'
import { Identity } from 'src/identity/identity.entity'
import validate from 'src/helpers/validate'
import { successLog, actionLog, log } from '../helpers/log'

@Injectable()
export class UsersService {
  private readonly users: User[]

  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    private connection: Connection,
  ) {}

  findAll(): Promise<User[]> {
    return this.repository.find()
  }

  findOne(id: number): Promise<User> {
    return this.repository.findOne(id)
  }

  async create({ email, firstName, lastName, password }: LocalSignupDTO): Promise<User> {
    const encryptPassword = await encrypt(password)
    let user = await this.repository.findOne({ email: email })

    if (!user) {
      user = await this.repository.create({
        firstName,
        lastName,
        email,
        role: UserRole.USER,
      })
      user = await this.repository.save(user)
    }

    if (!user) return null

    let identity = await this.identityRepository.findOne({
      user,
      provider: 'local',
    })

    if (identity) {
      throw new UnauthorizedException('User already sign_up')
    }

    identity = await this.identityRepository.create({
      user,
      uid: '',
      secret: encryptPassword,
      provider: 'local',
    })
    identity = await this.identityRepository.save(identity)

    return user
  }

  async update(id: number, dto: LocalSignupDTO) {
    const user = await this.repository.findOne({ id })
    if (!user) throw new NotFoundException('User not found')

    const formatedDTO = await validate<LocalSignupDTO>(dto, LocalSignupDTO)
    if (formatedDTO.password) {
      const identity = await this.identityRepository.findOne({ userId: id, provider: 'local' })
      identity.secret = await encrypt(formatedDTO.password)
      await this.identityRepository.save(identity)
      delete formatedDTO.password
      successLog({ title: 'UsersService', description: 'Successfull identity password update'})
    }
    
    await this.repository.update(id, formatedDTO)
    successLog({ title: 'UsersService', description: 'Successfull update of user'})
    return await this.repository.findOne({ id })
  }

  async delete(id: number): Promise<void> {
    const identities = await this.identityRepository.find({ userId: id })
    await Promise.all(identities.map(async i => {
      log({ title: 'UsersService', description: `Successfull delete identity ${i.provider}`})
      return await this.identityRepository.remove(i)
    }))
    await this.repository.delete(id)
    successLog({ title: 'UsersService', description: `Successfull delete user with id ${id}`})
  }
}
