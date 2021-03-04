import { DefaultAdminModule, DefaultAdminSite } from 'nestjs-admin'
import { UserAdmin } from '../user/user.admin'
import { IdentityAdmin } from '../identity/identity.admin'
import { VersionAdmin } from '../version/version.admin'
import { MediaAdmin } from '../media/media.admin'
import { GroupAdmin } from '../group/group.admin'
import { FileAdmin } from '../file/file.admin'
import { GridAdmin } from '../grid/grid.admin'
import { GridItemAdmin } from '../grid/grid_item.admin'
import { OptionAdmin } from '../options/options.admin'

export class BackofficeModule extends DefaultAdminModule {
  constructor(private readonly a: DefaultAdminSite) {
    super(a)
    this.a.register('Authentification', UserAdmin)
    this.a.register('Authentification', IdentityAdmin)
    this.a.register('Storage', FileAdmin)
    this.a.register('Storage', MediaAdmin)
    this.a.register('Models', VersionAdmin)
    this.a.register('Models', GroupAdmin)
    this.a.register('Models', GridAdmin)
    this.a.register('Models', GridItemAdmin)
    this.a.register('Models', OptionAdmin)
  }
}
