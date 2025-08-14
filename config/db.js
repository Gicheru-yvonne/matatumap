const pgp = require('pg-promise')();

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'matatumap',
    user: 'postgres',
    password: 'Keshy#6664'
}

const db = pgp(dbConfig);

module.exports = db;