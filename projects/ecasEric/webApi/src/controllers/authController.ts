import { Request, Response } from 'express';
import { BaseController } from '@policysynth/api/controllers/baseController.js';
import { AuthService } from '../services/authService.js';
import WebSocket from 'ws'; // Assuming BaseController requires wsClients

export class AuthController extends BaseController {
  public path = '/api/auth';
  private authService = new AuthService();

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients); // Pass wsClients if required by BaseController
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`${this.path}/login`, this.login);
    // Example: Add a protected route for registration if needed
    // this.router.post(`${this.path}/register`, authMiddleware, roleGuard('admin'), this.register);
  }

  private login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }

    try {
      const result = await this.authService.login(email, password);

      if (!result) {
        return res.status(401).send('Invalid email or password');
      }

      // Set cookie (optional, alternative to sending token in body)
      /*
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: result.expiresIn * 1000, // Convert expiry to milliseconds
        sameSite: 'lax' // Adjust as needed for your security requirements
      });
      res.status(200).json({ user: result.user, expiresIn: result.expiresIn });
      */

      // Send token in response body (common for SPAs)
      res.status(200).json(result);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal Server Error during login');
    }
  };

  // Example registration handler
  /*
  private register = async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }

    // Optional: Validate role if provided
    if (role && !['admin', 'editor'].includes(role)) {
        return res.status(400).send('Invalid role specified');
    }

    try {
      const newUser = await this.authService.register(email, password, role);
      if (!newUser) {
        // Error might be due to existing email or other validation
        return res.status(409).send('Registration failed, email might already exist.');
      }
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).send('Internal Server Error during registration');
    }
  };
  */
}