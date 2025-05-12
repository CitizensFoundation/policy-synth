import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';
import bcrypt from 'bcrypt';

interface AdminUserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  role: 'admin' | 'editor'; // Add more roles as needed
}

// Password is not stored, so it's not in attributes
interface AdminUserCreationAttributes extends Optional<AdminUserAttributes, 'id'> {
  password?: string; // Add optional password field for creation
}

class AdminUser extends Model<AdminUserAttributes, AdminUserCreationAttributes> implements AdminUserAttributes {
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public role!: 'admin' | 'editor';
  public password?: string; // Add optional property for hooks

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to compare password
  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordHash);
  }
}

AdminUser.init(
  {
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
  },
  {
    tableName: 'admin_users',
    sequelize,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) { // Check if password was provided
          const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
          user.passwordHash = await bcrypt.hash(user.password, saltRounds); // Hash the plain password
        }
      },
      beforeUpdate: async (user) => {
        // Hash password only if it was provided via the temporary field during update
        if (user.password) {
          const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
          user.passwordHash = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
  }
);

export { AdminUser };