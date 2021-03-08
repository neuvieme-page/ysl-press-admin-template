import { Connection, EntityManager } from 'typeorm'
import AdminUser from 'nestjs-admin/dist/src/adminUser/adminUser.entity'
import { DuplicateUsernameException } from 'nestjs-admin/dist/src/adminUser/exceptions/userAdmin.exception'
import { encrypt } from '../../auth/helpers/encryption'
import { UsersService } from '../../user/users.service'
import { User } from '../../user/user.entity'
import { Identity } from 'src/identity/identity.entity'
import { configService } from '../../config/config.service'

export const seedAdmin = async (connection: Connection): Promise<boolean> => {
  const entityManager = new EntityManager(connection)

  const repoU = connection.getRepository(User)
  const repoId = connection.getRepository(Identity)
  const service = new UsersService(repoU, repoId, connection)
  service.create({
    email: 'contact@neuviemepage.com',
    firstName: 'admin',
    lastName: 'admin',
    password: configService.get('SUPER_ADMIN_PASSWORD')
  })

  try {
    const admin = new AdminUser()
    admin.username = 'neuviemepage'
    admin.password = await encrypt('password')
  
    if (await entityManager.findOne(AdminUser, { username: admin.username })) {
      throw new DuplicateUsernameException(admin.username)
    }
  
    entityManager.save(admin)  
  } catch(err) {
    console.error("Cannot save admin user")
  }



  process.exit()
  return true
}
