const model = require('../models/Instrutores.model');

// LISTAR
exports.listar = async (req, res, next) => {
    try {
        const instrutores = await model.buscarTodos();
        res.json(instrutores);
    } catch (err) {
        next(err);
    }
};

// BUSCAR POR ID
exports.buscarPorId = async (req, res, next) => {
    try {
        const instrutor = await model.buscarPorId(req.params.id);

        if (!instrutor) {
            return res.status(404).json({ erro: 'Instrutor não encontrado' });
        }

        res.json(instrutor);
    } catch (err) {
        next(err);
    }
};

// CRIAR
exports.criar = async (req, res, next) => {
    try {
        const { nome, email, telefone } = req.body;

        if (!nome) {
            return res.status(400).json({ erro: 'Nome é obrigatório' });
        }

        const id = await model.criar({ nome, email, telefone });

        res.status(201).json({
            id,
            nome,
            email,
            telefone
        });

    } catch (err) {
        next(err);
    }
};

// ATUALIZAR
exports.atualizar = async (req, res, next) => {
    try {
        const { nome, email, telefone } = req.body;

        await model.atualizar(req.params.id, {
            nome,
            email,
            telefone
        });

        res.json({ mensagem: 'Instrutor atualizado' });

    } catch (err) {
        next(err);
    }
};

// DELETAR
exports.deletar = async (req, res, next) => {
    try {
        await model.deletar(req.params.id);
        res.json({ mensagem: 'Instrutor removido' });
    } catch (err) {
        next(err);
    }
};