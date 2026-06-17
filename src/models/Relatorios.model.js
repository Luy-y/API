const db = require('../config/db');

async function buscarPorPeriodo(data_inicio, data_fim, ambiente, instrutor, turma) {

    let query = `
    SELECT 
        r.*,
        a.nome AS ambiente_nome,
        i.nome AS instrutor_nome,
        t.nome_turma
    FROM Registros r
    JOIN Ambientes a ON r.id_ambiente = a.id_ambientes
    JOIN Instrutores i ON r.id_instrutor = i.id_instrutor
    JOIN Turmas t ON r.id_turma = t.id_turmas
    WHERE r.data_inicio <= ? AND r.data_fim >= ?
    `;

    const params = [data_fim, data_inicio]; // ⚠️ ordem invertida proposital

    if (instrutor) {
        query += " AND r.id_instrutor = ?";
        params.push(instrutor);
    }

    if (ambiente) {
        query += " AND r.id_ambiente = ?";
        params.push(ambiente);
    }

    if (turma) {
        query += " AND r.id_turma = ?";
        params.push(turma);
    }

    const [rows] = await db.promise().query(query, params);

    return rows;
}

module.exports = {
    buscarPorPeriodo
};