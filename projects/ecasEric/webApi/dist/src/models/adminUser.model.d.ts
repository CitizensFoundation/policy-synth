import { Model, Optional } from 'sequelize';
interface AdminUserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    role: 'admin' | 'editor';
}
interface AdminUserCreationAttributes extends Optional<AdminUserAttributes, 'id'> {
}
declare class AdminUser extends Model<AdminUserAttributes, AdminUserCreationAttributes> implements AdminUserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    role: 'admin' | 'editor';
    validatePassword(password: string): Promise<boolean>;
}
export { AdminUser };
//# sourceMappingURL=adminUser.model.d.ts.map