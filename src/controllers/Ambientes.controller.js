const model = require('../models/Ambientes.model');

exports.listar = async (req, res, next) => {
    try {
        const ambientes = await model.buscarTodos();
        res.json(ambientes);
    } catch (err) {
        next(err);
    }
};

exports.buscarPorId = async (req, res, next) => {
    try {
        const ambiente = await model.buscarPorId(req.params.id);

        if (!ambiente) {
            return res.status(404).json({ erro: 'Ambiente não encontrado' });
        }

        res.json(ambiente);
    } catch (err) {
        next(err);
    }
};

exports.criar = async (req, res, next) => {
    try {
        const { nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({ erro: 'Nome é obrigatório' });
        }

        const id = await model.criar({ nome, descricao });

        res.status(201).json({
            id,
            nome,
            descricao
        });

    } catch (err) {
        next(err);
    }
};

exports.atualizar = async (req, res, next) => {
    try {
        const { nome, descricao } = req.body;

        await model.atualizar(req.params.id, {
            nome,
            descricao
        });

        res.json({ mensagem: 'Ambiente atualizado' });

    } catch (err) {
        next(err);
    }
};

exports.deletar = async (req, res, next) => {
    try {
        await model.deletar(req.params.id);
        res.json({ mensagem: 'Ambiente removido' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ erro: 'Ambiente está em uso' });
        }
        next(err);
    }
};