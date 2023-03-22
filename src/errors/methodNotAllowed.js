function methodNotAllowed(req, res, next) {
  console.log('method not allowed', req, res)
  next({
    status: 405,
    message: `${req.method} not allowed for ${req.originalUrl}`,
  });
}

export default methodNotAllowed;
