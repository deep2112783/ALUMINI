export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
}

export function createError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
