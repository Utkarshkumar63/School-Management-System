import { DashboardService } from '../services/dashboardService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class DashboardController {
  static async getAdminDashboard(req, res, next) {
    try {
      const data = await DashboardService.getAdminDashboard();
      return ApiResponse.success(res, { data });
    } catch (error) {
      next(error);
    }
  }

  static async getTeacherDashboard(req, res, next) {
    try {
      const data = await DashboardService.getTeacherDashboard(req.user._id);
      return ApiResponse.success(res, { data });
    } catch (error) {
      next(error);
    }
  }

  static async getGuardianDashboard(req, res, next) {
    try {
      const data = await DashboardService.getGuardianDashboard(req.user._id);
      return ApiResponse.success(res, { data });
    } catch (error) {
      next(error);
    }
  }
}

