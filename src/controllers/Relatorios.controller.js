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

/* 🔒 Evita CSV/Formula Injection: campos que começam com =, +, - ou @
   podem ser interpretados como fórmula pelo Excel/LibreOffice ao abrir
   o arquivo (ex: um instrutor cadastrado como "=cmd|'/c calc'!A1").
   Prefixamos com um apóstrofo, que faz esses programas tratarem o
   valor como texto puro — sem mudar o dado nem o formato do CSV. */
function sanitizarCampoCSV(valor) {
    const texto = String(valor ?? "");

    if (/^[=+\-@]/.test(texto)) {
        return `'${texto}`;
    }

    return texto;
}

async function gerar(req, res) {
    try {
        let { data_inicio, data_fim, ambiente, instrutor, turma } = req.body;

        if (!data_inicio || !data_fim) {
            return res.status(400).json({
                erro: "Informe data_inicio e data_fim"
            });
        }

        // 🔒 Filtros são opcionais, mas se vierem preenchidos precisam ser
        // o ID numérico esperado (evita passar lixo pra query e deixa o
        // erro claro pro cliente em vez de simplesmente não filtrar nada).
        for (const [nome, valor] of Object.entries({ ambiente, instrutor, turma })) {
            if (valor !== undefined && valor !== null && valor !== "" && !/^\d+$/.test(valor)) {
                return res.status(400).json({ erro: `Filtro ${nome} inválido` });
            }
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

        for (const [nome, valor] of Object.entries({ ambiente, instrutor, turma })) {
            if (valor !== undefined && valor !== null && valor !== "" && !/^\d+$/.test(valor)) {
                return res.status(400).json({ erro: `Filtro ${nome} inválido` });
            }
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
            csv += `${formatarDataCSV(r.data_inicio)}${sep}${formatarDataCSV(r.data_fim)}${sep}${sanitizarCampoCSV(r.ambiente_nome)}${sep}${sanitizarCampoCSV(r.instrutor_nome)}${sep}${sanitizarCampoCSV(r.nome_turma)}\n`;
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

    const agora = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "America/Sao_Paulo"
        })
    );

    const hoje = new Date(agora);
    hoje.setHours(0, 0, 0, 0);

    const tardeInicio = new Date(hoje);
    tardeInicio.setHours(12, 55, 0, 0);

    const tardeFim = new Date(hoje);
    tardeFim.setHours(17, 50, 0, 0);

    const noiteInicio = new Date(hoje);
    noiteInicio.setHours(17, 55, 0, 0);

    const noiteFim = new Date(hoje);
    noiteFim.setHours(23, 0, 0, 0);

    console.log("Agora Brasília:", agora);

    if (agora >= tardeInicio && agora <= tardeFim) {
        return {
            inicio: tardeInicio,
            fim: tardeFim
        };
    }

    if (agora >= noiteInicio && agora <= noiteFim) {
        return {
            inicio: noiteInicio,
            fim: noiteFim
        };
    }

    return null;
}

/* 🔥 FORMATO CORRETO (SEM UTC) */
function formatSQL(date) {
    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/* 🔥 OCUPAÇÃO CORRIGIDA */

/* 🔥 OCUPAÇÃO HOJE (SSE STREAM) */
/* 🔥 OCUPAÇÃO HOJE (SSE STREAM - só emite quando muda) */
async function ocupacaoHoje(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    });

    res.flushHeaders?.();

    let ativo = true;
    let ultimoPayload = null; // guarda o último JSON enviado

    async function enviarSeMudou() {
        if (!ativo) return;

        try {
            const periodo = getPeriodoAtual();

            let registros = [];

            if (periodo) {
                const inicio = formatSQL(periodo.inicio);
                const fim = formatSQL(periodo.fim);

                registros = await model.buscarPorPeriodo(
                    inicio,
                    fim,
                    null,
                    null,
                    null
                );
            }

            const payload = JSON.stringify({ registros });

            // só escreve no stream se for diferente do último envio
            if (payload !== ultimoPayload) {
                console.log("Mudança detectada, enviando atualização. Registros:", registros.length);
                res.write(`data: ${payload}\n\n`);
                ultimoPayload = payload;
            }

        } catch (erro) {
            console.error("Erro na ocupação (stream):");
            console.error(erro);

            const erroPayload = JSON.stringify({ erro: "Erro na ocupação" });
            res.write(`data: ${erroPayload}\n\n`);
        }
    }

    // primeira emissão sempre acontece (ultimoPayload começa null)
    await enviarSeMudou();

    // verifica mudanças a cada 15s, mas só emite se algo mudou
    const intervalo = setInterval(enviarSeMudou, 15000);

    // heartbeat (comentário SSE) a cada 20s pra manter a conexão viva
    // sem disparar onmessage no front — evita timeout de proxy sem gerar ruído
    const heartbeat = setInterval(() => {
        if (ativo) res.write(`: ping\n\n`);
    }, 20000);

    req.on("close", () => {
        ativo = false;
        clearInterval(intervalo);
        clearInterval(heartbeat);
        res.end();
        console.log("Cliente desconectou do stream de ocupação.");
    });
}
/* 🔥 DOWNLOAD */
function baixar(req, res) {
    try {
        const nomeArquivo = req.params.nome;

        // 🔒 Só aceita o padrão exato de nome gerado pelo próprio sistema
        // (relatorio_<timestamp>.csv ou .txt). Bloqueia "..", barras,
        // caminhos absolutos e qualquer outro nome fora desse formato.
        if (!/^relatorio_\d+\.(csv|txt)$/.test(nomeArquivo)) {
            return res.status(400).json({ erro: "Nome de arquivo inválido" });
        }

        const pastaRelatorios = path.join(__dirname, "..", "relatorios");
        const caminho = path.join(pastaRelatorios, nomeArquivo);

        // 🔒 Defesa em profundidade: mesmo que a validação acima falhe por
        // algum motivo, garante que o caminho final resolvido continua
        // dentro da pasta "relatorios" antes de tentar ler o arquivo.
        const relativo = path.relative(pastaRelatorios, caminho);

        if (relativo.startsWith("..") || path.isAbsolute(relativo)) {
            return res.status(400).json({ erro: "Caminho de arquivo inválido" });
        }

        if (!fs.existsSync(caminho)) {
            return res.status(404).json({ erro: "Arquivo não encontrado" });
        }

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