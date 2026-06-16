const model = require('../models/Usuarios.model');

// LISTAR
exports.listar = async (req, res, next) => {
    try {
        const usuarios = await model.buscarTodos();
        res.json(usuarios);
    } catch (err) {
        next(err);
    }
};

// BUSCAR
exports.buscarPorId = async (req, res, next) => {
    try {
        const usuario = await model.buscarPorId(req.params.id);

        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.json(usuario);
    } catch (err) {
        next(err);
    }
};

// CRIAR
exports.criar = async (req, res, next) => {
    try {
        const { nome, email, telefone, tipo, senha } = req.body;

        if (!nome || !email || !tipo || !senha) {
            return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
        }

        if (!['ADM', 'Porteiro'].includes(tipo)) {
            return res.status(400).json({ erro: 'Tipo inválido' });
        }

        if (senha.length !== 6) {
            return res.status(400).json({ erro: 'Senha deve ter 6 caracteres' });
        }

        const id = await model.criar({ nome, email, telefone, tipo, senha });

        res.status(201).json({
            id,
            nome,
            email,
            telefone,
            tipo
        });

    } catch (err) {
        next(err);
    }
};

// ATUALIZAR
exports.atualizar = async (req, res, next) => {
    try {
        const { nome, email, telefone, tipo, senha } = req.body;

        const dados = {};

        if (nome) dados.nome = nome;
        if (email) dados.email = email;
        if (telefone) dados.telefone = telefone;

        if (tipo) {
            if (!['ADM', 'Porteiro'].includes(tipo)) {
                return res.status(400).json({ erro: 'Tipo inválido' });
            }
            dados.tipo = tipo;
        }

        if (senha && senha.trim() !== "") {
            if (senha.length !== 6) {
                return res.status(400).json({ erro: 'Senha deve ter 6 caracteres' });
            }
            dados.senha = senha;
        }

        await model.atualizar(req.params.id, dados);

        res.json({ mensagem: 'Usuário atualizado' });

    } catch (err) {
        next(err);
    }
};

// DELETAR
exports.deletar = async (req, res, next) => {
    try {
        await model.deletar(req.params.id);
        res.json({ mensagem: 'Usuário removido' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                erro: 'Usuário está vinculado a uma turma'
            });
        }
        next(err);
    }
};