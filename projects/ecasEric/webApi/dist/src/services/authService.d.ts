import { AdminUser } from '../models/adminUser.model.js';
export declare class AuthService {
    private jwtSecret;
    private jwtExpiresInSeconds;
    login(email: string, password: string): Promise<{
        token: string;
        user: Partial<AdminUser>;
        expiresIn: number;
    } | null>;
    register(email: string, password: string, role?: 'admin' | 'editor'): Promise<AdminUser | null>;
}
//# sourceMappingURL=authService.d.ts.map