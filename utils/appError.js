/**
 * Custom Error class for operational errors (errors we can predict might happen)
 * Extends the built-in Error class
 */
class AppError extends Error {
    /**
     * Create a new AppError
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code (400-499 for client errors, 500+ for server errors)
     */
    constructor(message, statusCode) {
      super(message);
  
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true; // Mark as operational error (not programming error)
  
      // Capture the stack trace (excluding the constructor call from it)
      Error.captureStackTrace(this, this.constructor);
    }
}
  
module.exports = AppError;