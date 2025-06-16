import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js';
import bcrypt from 'bcrypt';
class AdminUser extends Model {
    // Declare fields for TS and to satisfy implements, Sequelize handles them.
    id;
    email;
    passwordHash;
    role;
    // No temporary password?: string; field needed
    // Keep methods
    async validatePassword(password) {
        const storedHash = this.getDataValue('passwordHash');
        if (!password || !storedHash) {
            console.error('validatePassword: Missing password or stored hash');
            return false;
        }
        return await bcrypt.compare(password, storedHash);
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
            const plainPassword = user.getDataValue('passwordHash');
            if (plainPassword && typeof plainPassword === 'string' && plainPassword.length > 0) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
                const hash = await bcrypt.hash(plainPassword, saltRounds);
                user.setDataValue('passwordHash', hash);
            }
            else {
                console.error('Password hash (plain password) missing or invalid during user creation hook!');
                throw new Error('A valid password is required to create a user.');
            }
        },
        // beforeUpdate hook removed
    },
});
export { AdminUser };
//# sourceMappingURL=adminUser.model.js.map