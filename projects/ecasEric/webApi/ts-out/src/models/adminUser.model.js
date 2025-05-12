import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import bcrypt from 'bcrypt';
class AdminUser extends Model {
    id;
    email;
    passwordHash;
    role;
    createdAt;
    updatedAt;
    // Method to compare password
    async validatePassword(password) {
        return await bcrypt.compare(password, this.passwordHash);
    }
}
AdminUser.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'editor'),
        allowNull: false,
        defaultValue: 'editor',
    },
}, {
    tableName: 'admin_users',
    sequelize,
    hooks: {
        beforeCreate: async (user) => {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
            user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        },
        beforeUpdate: async (user) => {
            // Hash password only if it was changed
            if (user.changed('passwordHash')) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
                user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
            }
        },
    },
});
export { AdminUser };
//# sourceMappingURL=adminUser.model.js.map