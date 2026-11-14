import { AuditLog } from '../models/AuditLog.js';

export class AuditService {
  static async getAuditLogs({
    page = 1,
    limit = 15,
    action,
    entity,
    role,
    search,
    startDate,
    endDate,
  }) {
    const query = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (role) query.role = role;

    if (search) {
      query.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

