const model = require('../models/Relatorios.model');
const fs = require("fs");
const path = require("path");

function formatarData(data) {
    if (!data) return null;

    if (data.length === 19) {
        return data.replace('T', ' ');
    }

    return data.replace('T', ' ') + ':00';
}

function formatarDataCSV(data) {
    if (!data) return "";

    let d;

    // se já for Date
    if (data instanceof Date) {
        d = data;
    } else {
        // garante formato válido
        d = new Date(String(data).replace(" ", "T"));
    }

    if (isNaN(d)) return "";

    return d.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function gerar(req, res) {
    try {
        let { data_inicio, data_fim, ambiente, instrutor, turma } = req.body;

        if (!data_inicio || !data_fim) {
            return res.status(400).json({
                erro: "Informe data_inicio e data_fim"
            });
        }

        data_inicio = formatarData(data_inicio);
        data_fim = formatarData(data_fim);

        const registros = await model.buscarPorPeriodo(
            data_inicio,
            data_fim,
            ambiente,
            instrutor,
            turma
        );

        if (registros.length === 0) {
            return res.json({
                resumo: null,
                registros: []
            });
        }

        const total = registros.length;

        const ambientes = new Set(registros.map(r => r.ambiente_nome)).size;
        const instrutores = new Set(registros.map(r => r.instrutor_nome)).size;
        const turmas = new Set(registros.map(r => r.nome_turma)).size;

        const porcentagemAmbientes = ((ambientes / total) * 100).toFixed(2);
        const porcentagemInstrutores = ((instrutores / total) * 100).toFixed(2);
        const porcentagemTurmas = ((turmas / total) * 100).toFixed(2);

        res.json({
            resumo: {
                total,
                porcentagemAmbientes,
                porcentagemInstrutores,
                porcentagemTurmas
            },
            registros
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao gerar relatório"
        });
    }
}

/* 🔥 EXPORTAR CSV */
async function exportar(req, res) {
    try {
        let { data_inicio, data_fim, ambiente, instrutor, turma } = req.body;

        if (!data_inicio || !data_fim) {
            return res.status(400).json({
                erro: "Informe data_inicio e data_fim"
            });
        }

        data_inicio = formatarData(data_inicio);
        data_fim = formatarData(data_fim);

        const registros = await model.buscarPorPeriodo(
            data_inicio,
            data_fim,
            ambiente,
            instrutor,
            turma
        );

        if (registros.length === 0) {
            return res.json({ mensagem: "Nenhum dado para exportar" });
        }

        const sep = ";";

        let csv = `Data Inicio${sep}Data Fim${sep}Ambiente${sep}Instrutor${sep}Turma\n`;

        registros.forEach(r => {
            csv += `${formatarDataCSV(r.data_inicio)}${sep}${formatarDataCSV(r.data_fim)}${sep}${r.ambiente_nome}${sep}${r.instrutor_nome}${sep}${r.nome_turma}\n`;
        });

        const pasta = path.join(__dirname, "..", "relatorios");

        if (!fs.existsSync(pasta)) {
            fs.mkdirSync(pasta);
        }

        const nomeArquivo = `relatorio_${Date.now()}.csv`;
        const caminho = path.join(pasta, nomeArquivo);

        fs.writeFileSync(caminho, "\uFEFF" + csv, "utf8");

        res.json({
            mensagem: "Relatório exportado com sucesso",
            arquivo: nomeArquivo
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao exportar relatório"
        });
    }
}

function getPeriodoAtual() {
    const agora = new Date();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const tardeInicio = new Date(hoje);
    tardeInicio.setHours(12, 55, 0);

    const tardeFim = new Date(hoje);
    tardeFim.setHours(17, 50, 0);

    const noiteInicio = new Date(hoje);
    noiteInicio.setHours(17, 55, 0);

    const noiteFim = new Date(hoje);
    noiteFim.setHours(23, 0, 0);

    if (agora >= tardeInicio && agora <= tardeFim) {
        return { inicio: tardeInicio, fim: tardeFim };
    }

    if (agora >= noiteInicio && agora <= noiteFim) {
        return { inicio: noiteInicio, fim: noiteFim };
    }

    return null;
}

/* 🔥 FORMATO CORRETO (SEM UTC) */
function formatSQL(date) {
    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/* 🔥 OCUPAÇÃO CORRIGIDA */
async function ocupacaoHoje(req, res) {
    try {
        const periodo = getPeriodoAtual();

        if (!periodo) {
            return res.json({ registros: [] });
        }

        const inicio = formatSQL(periodo.inicio);
        const fim = formatSQL(periodo.fim);

        const registros = await model.buscarPorPeriodo(
            inicio,
            fim,
            null,
            null,
            null
        );

        res.json({ registros });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro na ocupação" });
    }
}

/* 🔥 DOWNLOAD */
function baixar(req, res) {
    try {
        const nomeArquivo = req.params.nome;
        const caminho = path.join(__dirname, "..", "relatorios", nomeArquivo);

        res.download(caminho);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao baixar arquivo" });
    }
}

module.exports = {
    gerar,
    exportar,
    baixar,
    ocupacaoHoje
};