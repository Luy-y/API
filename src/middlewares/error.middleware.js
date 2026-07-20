module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;

  // Log completo continua no servidor — nada disso vai pro cliente.
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error(err);

  // 🔒 Em erros 500 (inesperados: falha de banco, bug, etc.) nunca expomos
  // err.message ao cliente, porque pode conter detalhes internos (nome de
  // tabela/coluna, mensagem do driver do MySQL, caminho de arquivo etc.).
  // Erros com status menor que 500 e message definida (lançados de forma
  // intencional em algum controller) continuam mostrando a mensagem, já
  // que hoje nenhum controller usa esse padrão — isso é só para não
  // quebrar nada se um dia passarem a usar.
  const mensagemPublica = status >= 500
    ? 'Erro interno do servidor'
    : (err.message || 'Erro na requisição');

  res.status(status).json({
      erro: mensagemPublica,
      status
  });
};