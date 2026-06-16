const db = require('../config/db');

exports.buscarPorEmail = async (email) => {
    const [rows] = await db.promise().query(
        `SELECT 
            id,
            email,
            senha,
            tipo
         FROM usuarios 
         WHERE email = ?`,
        [email]
    );

    return rows[0];
};