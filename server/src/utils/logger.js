export const logger = {
  info: (msg, meta = '') => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta);
    }
  },
  warn: (msg, meta = '') => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta);
    }
  },
  error: (msg, err = '') => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err);
  },
  audit: (actor, action, entity, entityId) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[AUDIT] ${new Date().toISOString()} | Actor: ${actor} | Action: ${action} | Entity: ${entity}#${entityId}`);
    }
  }
};

