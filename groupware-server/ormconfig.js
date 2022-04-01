module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.NODE_ENV !== 'production' ? 3306 : process.env.DB_PORT,
  entities: [
    process.env.NODE_ENV !== 'production'
      ? 'dist/entities/*.entity.js'
      : 'entities/*.entity.js',
  ],
  synchronize: false,
  migrations: [
    process.env.NODE_ENV !== 'production'
      ? 'src/migrations/*.ts'
      : 'migrations/*.js',
  ],
  seeds: ['dist/seeds/*.js'],
  factories: ['dist/factories/*.js'],
  migrationsRun: true,
  extra: {
    charset: 'utf8mb4_bin',
  },
  cli: {
    migrationsDir: 'src/migrations',
  },
};
