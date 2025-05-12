import { AdminUser } from '../models/adminUser.model';
import jwt from 'jsonwebtoken';
export class AuthService {
    jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    jwtExpiresIn = '1h'; // Token expiration time
    async login(email, password) {
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
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const signOptions = {
            expiresIn: Number(this.jwtExpiresIn),
        };
        const token = jwt.sign(payload, this.jwtSecret, signOptions);
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp;
        console.log(`Login successful: ${email}`);
        return {
            token,
            user: { id: user.id, email: user.email, role: user.role },
            expiresIn,
        };
    }
    // Optional: Add a register method if needed, protected appropriately
    async register(email, password, role = 'editor') {
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
            return userWithoutPassword;
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                console.error(`Registration failed: Email already exists - ${email}`);
            }
            else {
                console.error('Registration failed:', error);
            }
            return null;
        }
    }
}
//# sourceMappingURL=authService.js.map