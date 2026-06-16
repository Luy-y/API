module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;

  console.error(`[${new Date().toISOString()}]`, err);

  res.status(status).json({
      erro: err.message || 'Erro interno do servidor',
      status,
      path: req.originalUrl
  });
};