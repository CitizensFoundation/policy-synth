import { EcasYeaServerApi } from './app.js';
import { controllerClasses } from './routes.js';
import { sequelize } from './models/index.js';
// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connection has been established successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));
const app = new EcasYeaServerApi(controllerClasses, parseInt(process.env.PORT || '4078'));
app.listen();
//# sourceMappingURL=server.js.map