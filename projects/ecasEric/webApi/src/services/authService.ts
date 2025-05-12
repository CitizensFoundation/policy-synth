import { AdminUser } from '../models/adminUser.model';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
  private jwtSecret: Secret = process.env.JWT_SECRET || 'fallback-secret';
  private jwtExpiresIn = '1h'; // Token expiration time

  public async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: Partial<AdminUser>; expiresIn: number } | null> {
    const user = await AdminUser.findOne({ where: { email } });

    if (!user) {
      console.warn(`Login attempt failed: User not found - ${email}`);
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      console.warn(`Login attempt failed: Invalid password - ${email}`);
      return null;
    }

    const payload: object = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const signOptions: SignOptions = {
      expiresIn: Number(this.jwtExpiresIn),
    };

    const token = jwt.sign(payload, this.jwtSecret, signOptions);

    const decoded = jwt.decode(token) as { exp: number };
    const expiresIn = decoded.exp;

    console.log(`Login successful: ${email}`);
    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
      expiresIn,
    };
  }

  // Optional: Add a register method if needed, protected appropriately
  public async register(
    email: string,
    password: string,
    role: 'admin' | 'editor' = 'editor'
  ): Promise<AdminUser | null> {
    try {
      // Note: Hashing happens in the model hook
      const newUser = await AdminUser.create({
        email,
        passwordHash: password, // Pass the plain password, hook will hash
        role,
      });
      console.log(`User registered: ${email}`);
      // Return without the password hash
      const { passwordHash, ...userWithoutPassword } = newUser.get({
        plain: true,
      });
      return userWithoutPassword as AdminUser;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.error(`Registration failed: Email already exists - ${email}`);
      } else {
        console.error('Registration failed:', error);
      }
      return null;
    }
  }

  // Optional: Refresh token logic could be added here
}