const db = require('../config/db');

// LISTAR
exports.buscarTodos = async () => {
    const [rows] = await db.promise().query(`
        SELECT * FROM Instrutores
    `);
    return rows;
};

// BUSCAR POR ID
exports.buscarPorId = async (id) => {
    const [rows] = await db.promise().query(
        'SELECT * FROM Instrutores WHERE id_instrutor = ?',
        [id]
    );
    return rows[0];
};

// CRIAR
exports.criar = async ({ nome, email, telefone }) => {
    const [result] = await db.promise().query(
        `INSERT INTO Instrutores (nome, email, telefone)
         VALUES (?, ?, ?)`,
        [nome, email, telefone]
    );

    return result.insertId;
};

// ATUALIZAR
exports.atualizar = async (id, { nome, email, telefone }) => {
    await db.promise().query(
        `UPDATE Instrutores
         SET nome = ?, email = ?, telefone = ?
         WHERE id_instrutor = ?`,
        [nome, email, telefone, id]
    );
};

// DELETAR
exports.deletar = async (id) => {
    await db.promise().query(
        'DELETE FROM Instrutores WHERE id_instrutor = ?',
        [id]
    );
};