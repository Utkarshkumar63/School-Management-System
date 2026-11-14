import { AuditService } from '../services/auditService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuditController {
  static async getLogs(req, res, next) {
    try {
      const { page, limit, action, entity, role, search, startDate, endDate } = req.query;
      const result = await AuditService.getAuditLogs({
        page,
        limit,
        action,
        entity,
        role,
        search,
        startDate,
        endDate,
      });

      return ApiResponse.success(res, {
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

