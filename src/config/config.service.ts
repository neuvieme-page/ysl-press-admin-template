import { TypeOrmModuleOptions } from '@nestjs/typeorm'

interface OAuthConfig {
  provider: string
  callbackURL: string
  apiKey: string
  apiSecret: string
}

// eslint-disable-next-line
require('dotenv').config()

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public get(key: string, throwOnMissing = true): string {
    const value = this.env[key]
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`)
    }

    return value
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.get(k, true))
    return this
  }

  public getSecret() {
    return this.get('APP_SECRET')
  }

  public getPort() {
    return this.get('PORT', true)
  }

  public getLogLevel() {
    return this.get('LOG_LEVEL', false) || 1
  }

  public isProduction() {
    const mode = this.get('ENV', false)
    return mode != 'development'
  }

  public getProvider(provider): null | OAuthConfig {
    const exist = this.get(`${provider.toUpperCase()}_API_KEY`, false)
    if (!exist) {
      return null
    }
    return {
      provider,
      callbackURL: this.get(`${provider.toUpperCase()}_CALLBACK_URL`, false),
      apiKey: this.get(`${provider.toUpperCase()}_API_KEY`),
      apiSecret: this.get(`${provider.toUpperCase()}_API_SECRET`),
    }
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const databaseURL = this.get('DATABASE_URL', false)

    if (databaseURL) {
      const postgresUrl = /^(.+?):\/\/(.+?):(.+?)@([\w-.]+?):(\d{2,4})\/(.+?)$/
      const matches = databaseURL.match(postgresUrl)
      if (matches) {
        var [
          _,
          DB_PROVIDER,
          DB_USER,
          DB_PASSWORD,
          DB_HOST,
          DB_PORT,
          DB_NAME,
        ] = matches
      } else {
        throw new Error(
          `config error - DATABSE_URL given but with an invalid format`,
        )
      }
    }

    const sslConfig = this.isProduction()
      ? {
          ssl: true,
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        }
      : {}

    return {
      type: 'postgres',
      host: DB_HOST || this.get('DB_HOST', false),
      port: parseInt(DB_PORT || this.get('DB_PORT', false)),
      username: DB_USER || this.get('DB_USER', false),
      password: DB_PASSWORD || this.get('DB_PASSWORD', false),
      database: DB_NAME || this.get('DB_NAME', false),
      entities: [
        // '**/*.entity{.ts,.js}'
      ],
      // migrationsTableName: 'migration',
      // migrations: ['src/db/migrations/*.ts'],
      synchronize: true,
      autoLoadEntities: true,
      ...sslConfig,
      cli: {
        migrationsDir: 'src/db/migration',
      },
    }
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'APP_SECRET',
  'GCLOUD_STORAGE_BUCKET',
  'SUPER_ADMIN_USERNAME',
  'SUPER_ADMIN_PASSWORD',
])

export { configService }
