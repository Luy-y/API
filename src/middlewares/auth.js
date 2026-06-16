function verificarAdmin(req, res, next) {

    const tipo = req.headers['tipo_usuario'];

    if (tipo !== 'ADM') {
        return res.status(403).json({ erro: 'Acesso negado' });
    }

    next();
}

module.exports = { verificarAdmin };