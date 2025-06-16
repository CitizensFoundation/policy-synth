import { AdminUser } from '../models/adminUser.model.js';
import jwt from 'jsonwebtoken';
export class AuthService {
    jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    // Store expiration time in seconds (e.g., 1 hour = 3600 seconds)
    jwtExpiresInSeconds = 3600;
    async login(email, password) {
        const user = await AdminUser.findOne({ where: { email } });
        // --- Start Debug Logging ---
        console.log('AuthService: User fetched from DB:', user ? user.toJSON() : 'null');
        if (user) {
            console.log('AuthService: User passwordHash:', user.passwordHash);
        }
        // --- End Debug Logging ---
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
            id: user.getDataValue('id'),
            email: user.getDataValue('email'),
            role: user.getDataValue('role'),
        };
        const signOptions = {
            expiresIn: this.jwtExpiresInSeconds, // Pass the number of seconds
        };
        const token = jwt.sign(payload, this.jwtSecret, signOptions);
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp;
        console.log(`Login successful: ${email}`);
        return {
            token,
            user: {
                id: user.getDataValue('id'),
                email: user.getDataValue('email'),
                role: user.getDataValue('role')
            },
            expiresIn,
        };
    }
    // Optional: Add a register method if needed, protected appropriately
    async register(email, password, role = 'editor') {
        try {
            // Note: Hashing happens in the model hook. For consistency with login, use getDataValue if reading back.
            const newUser = await AdminUser.create({
                email,
                // Pass plain password, hook will hash it (uses getDataValue/setDataValue internally now)
                passwordHash: password,
                role,
            });
            console.log(`User registered: ${email}`);
            // Return without the password hash
            // Use getDataValue for consistency when accessing model properties
            const plainUser = newUser.get({ plain: true });
            const { passwordHash, ...userWithoutPassword } = plainUser;
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