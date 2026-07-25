// Wrap async route handler biar error di-forward ke error middleware,
// bukan jadi unhandled promise rejection yang bisa crash server.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
