import { Sequelize } from 'sequelize';
declare let sequelize: Sequelize;
interface Db {
    sequelize: Sequelize;
    Sequelize: typeof Sequelize;
    Topic?: any;
    QAPair?: any;
    CountryLink?: any;
    AdminUser?: any;
    Review?: any;
    ChatSession?: any;
}
declare const db: Db;
export { sequelize, db };
//# sourceMappingURL=index.d.ts.map