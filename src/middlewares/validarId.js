/**
 * Garante que req.params.id seja um número inteiro (ex: "12"), antes de
 * qualquer consulta ao banco.
 *
 * Motivo: os controllers hoje repassam req.params.id direto para os models
 * sem checar o formato. Como as queries já usam parâmetros (?), não existe
 * risco de SQL Injection aqui — mas um ID malformado (texto, símbolos,
 * "1 OR 1=1" etc.) ainda podia chegar até o banco e gerar um erro
 * inesperado (500) em vez de uma resposta clara. Esse middleware corta
 * isso na entrada, com uma resposta 400 explicando o problema.
 *
 * Não muda nada para requisições válidas (IDs numéricos continuam
 * funcionando exatamente como antes).
 */
function validarId(req, res, next) {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
    }

    next();
}

module.exports = { validarId };
