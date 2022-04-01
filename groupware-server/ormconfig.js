module.exports = {
  type: 'mysql',
  host: '34.85.62.171',
  username: 'groupware-dev-root',
  password: '6sUs6LZHpdhjDY3wYVHxj7AXVPdaP7M',
  database: 'growpware-mobile-test',
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
