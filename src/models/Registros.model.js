const db = require('../config/db');

// LISTAR COM JOIN
exports.buscarTodos = async () => {

    const [rows] = await db.promise().query(`
        SELECT 
            r.*,
            a.nome AS ambiente_nome,
            i.nome AS instrutor_nome,
            t.nome_turma
        FROM Registros r
        JOIN Ambientes a 
            ON r.id_ambiente = a.id_ambientes
        JOIN Instrutores i 
            ON r.id_instrutor = i.id_instrutor
        JOIN Turmas t 
            ON r.id_turma = t.id_turmas
        ORDER BY r.data_inicio DESC
    `);

    return rows;
};

// BUSCAR POR ID
exports.buscarPorId = async (id) => {

    const [rows] = await db.promise().query(`
        SELECT 
            r.*,
            a.nome AS ambiente_nome,
            i.nome AS instrutor_nome,
            t.nome_turma
        FROM Registros r
        JOIN Ambientes a 
            ON r.id_ambiente = a.id_ambientes
        JOIN Instrutores i 
            ON r.id_instrutor = i.id_instrutor
        JOIN Turmas t 
            ON r.id_turma = t.id_turmas
        WHERE r.id_registro = ?
    `, [id]);

    return rows[0];
};

// VERIFICAR CONFLITO
exports.verificarConflito = async (
    id_ambiente,
    id_instrutor,
    inicio,
    fim
) => {

    try {

        console.log("inicio recebido:", inicio);
        console.log("fim recebido:", fim);

        const inicioDate = new Date(inicio);
        const fimDate = new Date(fim);

        // VALIDAR DATAS
        if (
            isNaN(inicioDate.getTime()) ||
            isNaN(fimDate.getTime())
        ) {
            throw new Error("Data inválida");
        }

        // VALIDAR INTERVALO
        if (inicioDate >= fimDate) {
            throw new Error("Intervalo inválido");
        }

        const inicioFormatado = inicioDate
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        const fimFormatado = fimDate
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        // CONFLITO AMBIENTE
        const [conflitoAmbiente] = await db.promise().query(`
            SELECT id_registro
            FROM Registros
            WHERE id_ambiente = ?
            AND data_inicio < ?
            AND data_fim > ?
            LIMIT 1
        `, [
            id_ambiente,
            fimFormatado,
            inicioFormatado
        ]);

        if (conflitoAmbiente.length > 0) {
            return true;
        }

        // CONFLITO INSTRUTOR
        const [conflitoInstrutor] = await db.promise().query(`
            SELECT id_registro
            FROM Registros
            WHERE id_instrutor = ?
            AND data_inicio < ?
            AND data_fim > ?
            LIMIT 1
        `, [
            id_instrutor,
            fimFormatado,
            inicioFormatado
        ]);

        if (conflitoInstrutor.length > 0) {
            return true;
        }

        return false;

    } catch (erro) {

        console.error(
            "Erro ao verificar conflito:",
            erro
        );

        return true;
    }
};

// CRIAR
exports.criar = async (dados) => {

    const {
        id_ambiente,
        id_instrutor,
        id_turma,
        data_inicio,
        data_fim
    } = dados;

    const [result] = await db.promise().query(`
        INSERT INTO Registros (
            id_ambiente,
            id_instrutor,
            id_turma,
            data_inicio,
            data_fim
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        id_ambiente,
        id_instrutor,
        id_turma,
        data_inicio,
        data_fim
    ]);

    return result.insertId;
};

// ATUALIZAR
exports.atualizar = async (id, dados) => {

    const {
        id_ambiente,
        id_instrutor,
        id_turma,
        data_inicio,
        data_fim
    } = dados;

    await db.promise().query(`
        UPDATE Registros
        SET
            id_ambiente = ?,
            id_instrutor = ?,
            id_turma = ?,
            data_inicio = ?,
            data_fim = ?
        WHERE id_registro = ?
    `, [
        id_ambiente,
        id_instrutor,
        id_turma,
        data_inicio,
        data_fim,
        id
    ]);
};

// DELETAR
exports.deletar = async (id) => {

    await db.promise().query(`
        DELETE FROM Registros
        WHERE id_registro = ?
    `, [id]);
};