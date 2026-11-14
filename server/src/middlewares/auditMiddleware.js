import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export async function recordAudit({
  actor = null,
  actorName = 'System',
  role = 'SYSTEM',
  action,
  entity,
  entityId = null,
  details = {},
  ipAddress = '',
  userAgent = '',
}) {
  try {
    const log = await AuditLog.create({
      actor,
      actorName,
      role,
      action,
      entity,
      entityId: entityId ? entityId.toString() : null,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
    logger.audit(actorName, action, entity, entityId);
    return log;
  } catch (error) {
    logger.error('Failed to write audit log', error);
  }
}

export function auditAction(action, entity) {
  return (req, res, next) => {
    // We attach an audit helper to res.locals so controllers can log changes easily
    res.locals.recordAudit = async (entityId, details = {}) => {
      const actor = req.user ? req.user._id : null;
      const actorName = req.user ? req.user.name : 'Unknown';
      const role = req.user ? req.user.role : 'ANONYMOUS';
      const ipAddress = req.ip || req.connection?.remoteAddress || '';
      const userAgent = req.get('user-agent') || '';

      return recordAudit({
        actor,
        actorName,
        role,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      });
    };
    next();
  };
}

