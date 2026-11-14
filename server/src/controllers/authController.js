import { AuthService } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { recordAudit } from '../middlewares/auditMiddleware.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      // Record audit log for login
      await recordAudit({
        actor: result.user.id,
        actorName: result.user.name,
        role: result.user.role,
        action: 'LOGIN',
        entity: 'User',
        entityId: result.user.id,
        details: { email },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent'),
      });

      return ApiResponse.success(res, {
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const result = await AuthService.getProfile(req.user._id);
      return ApiResponse.success(res, {
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

