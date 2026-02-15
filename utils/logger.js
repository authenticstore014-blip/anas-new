
/**
 * SwiftPolicy Enterprise Logging Utility
 */
export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta);
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, {
      message: error.message,
      stack: error.stack,
      ...error
    });
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta);
  },
  audit: (action, details) => {
    // Strategic audit hook for compliance
    console.log(`[AUDIT] ${action}: ${JSON.stringify(details)}`);
  }
};
