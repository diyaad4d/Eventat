const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.name || 'ServerError'}: ${err.message}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
