const db = require('../config/db');

exports.buscarTodos = async () => {
    const [rows] = await db.promise().query(`
        SELECT * FROM Turmas
    `);
    return rows;
};

exports.buscarPorId = async (id) => {
    const [rows] = await db.promise().query(
        `SELECT * FROM Turmas WHERE id_turmas = ?`,
        [id]
    );
    return rows[0];
};

exports.criar = async ({ nome_turma }) => {
    const [result] = await db.promise().query(
        `INSERT INTO Turmas (nome_turma)
         VALUES (?)`,
        [nome_turma]
    );
    return result.insertId;
};

exports.atualizar = async (id, { nome_turma }) => {
    await db.promise().query(
        `UPDATE Turmas
         SET nome_turma = ?
         WHERE id_turmas = ?`,
        [nome_turma, id]
    );
};

exports.deletar = async (id) => {
    await db.promise().query(
        `DELETE FROM Turmas WHERE id_turmas = ?`,
        [id]
    );
};