const db = require('../config/db');

exports.buscarTodos = async () => {
    const [rows] = await db.promise().query(`
        SELECT * FROM Ambientes
    `);
    return rows;
};

exports.buscarPorId = async (id) => {
    const [rows] = await db.promise().query(`
        SELECT * FROM Ambientes
        WHERE id_ambientes = ?
    `, [id]);

    return rows[0];
};

exports.criar = async ({ nome, descricao }) => {
    const [result] = await db.promise().query(
        `INSERT INTO Ambientes (nome, descrição) VALUES (?, ?)`,
        [nome, descricao]
    );

    return result.insertId;
};

exports.atualizar = async (id, dados) => {

    const campos = [];
    const valores = [];

    if (dados.nome !== undefined) {
        campos.push('nome = ?');
        valores.push(dados.nome);
    }

    if (dados.descricao !== undefined) {
        campos.push('descrição = ?');
        valores.push(dados.descricao);
    }

    if (campos.length === 0) return;

    valores.push(id);

    await db.promise().query(
        `UPDATE Ambientes SET ${campos.join(', ')} WHERE id_ambientes = ?`,
        valores
    );
};

exports.deletar = async (id) => {
    await db.promise().query(
        'DELETE FROM Ambientes WHERE id_ambientes = ?',
        [id]
    );
};