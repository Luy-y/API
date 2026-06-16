const model = require('../models/Registros.model');
const ambienteModel = require('../models/Ambientes.model');
const instrutorModel = require('../models/Instrutores.model');
const turmaModel = require('../models/Turmas.model');

function formatarData(data) {

    if (!data) return null;

    // datetime-local → 2026-05-21T22:30
    // mysql → 2026-05-21 22:30:00

    return data.replace('T', ' ') + ':00';
}

// LISTAR
exports.listar = async (req, res, next) => {

    try {

        const registros = await model.buscarTodos();

        res.json(registros);

    } catch (err) {

        next(err);
    }
};

// BUSCAR
exports.buscarPorId = async (req, res, next) => {

    try {

        const registro = await model.buscarPorId(req.params.id);

        if (!registro) {

            return res.status(404).json({
                erro: 'Registro não encontrado'
            });
        }

        res.json(registro);

    } catch (err) {

        next(err);
    }
};

// CRIAR
exports.criar = async (req, res, next) => {

    try {

        let {
            id_ambiente,
            id_instrutor,
            id_turma,
            data_inicio,
            data_fim
        } = req.body;

        // LOGS
        console.log("BODY:", req.body);

        // VALIDAÇÃO CAMPOS
        if (
            !id_ambiente ||
            !id_instrutor ||
            !id_turma ||
            !data_inicio ||
            !data_fim
        ) {

            return res.status(400).json({
                erro: 'Todos os campos são obrigatórios'
            });
        }

        // FORMATAR DATAS
        data_inicio = formatarData(data_inicio);
        data_fim = formatarData(data_fim);

        // VALIDAR DATAS
        const inicioDate = new Date(data_inicio);
        const fimDate = new Date(data_fim);

        if (
            isNaN(inicioDate.getTime()) ||
            isNaN(fimDate.getTime())
        ) {

            return res.status(400).json({
                erro: 'Datas inválidas'
            });
        }

        // VALIDAR INTERVALO
        if (inicioDate >= fimDate) {

            return res.status(400).json({
                erro: 'Data final deve ser maior que data inicial'
            });
        }

        // VALIDAR FK
        const ambiente = await ambienteModel.buscarPorId(id_ambiente);

        if (!ambiente) {

            return res.status(400).json({
                erro: 'Ambiente inválido'
            });
        }

        const instrutor = await instrutorModel.buscarPorId(id_instrutor);

        if (!instrutor) {

            return res.status(400).json({
                erro: 'Instrutor inválido'
            });
        }

        const turma = await turmaModel.buscarPorId(id_turma);

        if (!turma) {

            return res.status(400).json({
                erro: 'Turma inválida'
            });
        }

        // VERIFICAR CONFLITO
        const conflito = await model.verificarConflito(
            id_ambiente,
            id_instrutor,
            data_inicio,
            data_fim
        );

        if (conflito) {

            return res.status(400).json({
                erro: 'Ambiente ou instrutor já ocupado neste horário'
            });
        }

        // CRIAR
        const id = await model.criar({
            id_ambiente,
            id_instrutor,
            id_turma,
            data_inicio,
            data_fim
        });

        res.status(201).json({
            mensagem: 'Registro criado com sucesso',
            id
        });

    } catch (err) {

        console.error(err);

        next(err);
    }
};

// ATUALIZAR
exports.atualizar = async (req, res, next) => {

    try {

        let {
            id_ambiente,
            id_instrutor,
            id_turma,
            data_inicio,
            data_fim
        } = req.body;

        if (data_inicio) {
            data_inicio = formatarData(data_inicio);
        }

        if (data_fim) {
            data_fim = formatarData(data_fim);
        }

        // VALIDAR DATAS
        if (data_inicio && data_fim) {

            const inicioDate = new Date(data_inicio);
            const fimDate = new Date(data_fim);

            if (
                isNaN(inicioDate.getTime()) ||
                isNaN(fimDate.getTime())
            ) {

                return res.status(400).json({
                    erro: 'Datas inválidas'
                });
            }

            if (inicioDate >= fimDate) {

                return res.status(400).json({
                    erro: 'Data final deve ser maior que inicial'
                });
            }
        }

        await model.atualizar(req.params.id, {
            id_ambiente,
            id_instrutor,
            id_turma,
            data_inicio,
            data_fim
        });

        res.json({
            mensagem: 'Registro atualizado'
        });

    } catch (err) {

        console.error(err);

        next(err);
    }
};

// DELETAR
exports.deletar = async (req, res, next) => {

    try {

        await model.deletar(req.params.id);

        res.json({
            mensagem: 'Registro removido'
        });

    } catch (err) {

        console.error(err);

        next(err);
    }
};