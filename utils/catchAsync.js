/**
 * Wraps an async function to catch errors and pass them to Express error handling middleware
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - A function that handles errors properly for Express
 */
module.exports = (fn) => {
    return (req, res, next) => {
      // Resolve the promise returned by the async function
      // If it rejects, catch the error and pass it to next()
      fn(req, res, next).catch(next);
    };
  };