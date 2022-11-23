module.exports = {
  type: 'mysql',
  host:
    process.env.NODE_ENV !== 'production' ? '127.0.0.1' : process.env.DB_HOST,
  username:
    process.env.NODE_ENV !== 'production' ? 'develop' : process.env.DB_USERNAME,
  password:
    process.env.NODE_ENV !== 'production'
      ? 'password'
      : process.env.DB_PASSWORD,
  database:
    process.env.NODE_ENV !== 'production'
      ? 'groupware-mysql8'
      : process.env.DB_DATABASE,
  port: process.env.NODE_ENV !== 'production' ? 3306 : process.env.DB_PORT,
  entities: [
    'dist/entities/*.entity.js',
    // process.env.NODE_ENV !== 'production'
    //   ? 'dist/entities/*.entity.js'
    //   : 'entities/*.entity.js',
  ],
  synchronize: false,
  migrations: [
    process.env.NODE_ENV !== 'production'
      ? 'src/migrations/*.ts'
      : 'dist/migrations/*.js',
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
