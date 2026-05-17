// Définir les variables d'environnement AVANT tout import de modules
process.env['PORT'] = '3001';
process.env['NODE_ENV'] = 'test';
process.env['MONGODB_URI'] = 'mongodb://localhost:27017/congofood_test';
process.env['JWT_SECRET'] = 'test_jwt_secret_must_be_at_least_32_characters_long';
process.env['JWT_REFRESH_SECRET'] = 'test_refresh_secret_must_be_at_least_32_chars_ok';
process.env['JWT_EXPIRES_IN'] = '15m';
process.env['JWT_REFRESH_EXPIRES_IN'] = '30d';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['AFRICAS_TALKING_API_KEY'] = 'test_at_key';
process.env['AFRICAS_TALKING_USERNAME'] = 'sandbox';
