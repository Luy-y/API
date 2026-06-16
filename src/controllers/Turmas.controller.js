const model = require('../models/Turmas.model');

exports.listar = async (req, res, next) => {
    try {
        const turmas = await model.buscarTodos();
        res.json(turmas);
    } catch (err) {
        next(err);
    }
};

exports.buscarPorId = async (req, res, next) => {
    try {
        const turma = await model.buscarPorId(req.params.id);

        if (!turma) {
            return res.status(404).json({ erro: 'Turma não encontrada' });
        }

        res.json(turma);
    } catch (err) {
        next(err);
    }
};

exports.criar = async (req, res, next) => {
    try {
        const { nome_turma } = req.body;

        if (!nome_turma) {
            return res.status(400).json({
                erro: 'Campos obrigatórios'
            });
        }

        const id = await model.criar({ nome_turma });

        res.status(201).json({ id });

    } catch (err) {
        next(err);
    }
};

exports.atualizar = async (req, res, next) => {
    try {
        const { nome_turma } = req.body;

        await model.atualizar(req.params.id, {
            nome_turma
        });

        res.json({ mensagem: 'Atualizado' });

    } catch (err) {
        next(err);
    }
};

exports.deletar = async (req, res, next) => {
    try {
        await model.deletar(req.params.id);
        res.json({ mensagem: 'Removido' });
    } catch (err) {
        next(err);
    }
};