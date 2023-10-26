
const loginUser = async (req, res, db) => {
    let { id, username } = req.user;

    let userExists = await db.query(`
        SELECT * FROM account
        WHERE userid = $1;
    `, [id]);

    if (userExists?.rows?.length === 0) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            await client.query(`
                INSERT INTO account (userid, username)
                VALUES ($1, $2);
            `, [id, username]);

            client.query('COMMIT');
        } catch {
            client.query('ROLLBACK');
            console.log("Error adding user to database");
        } finally {
            client.release();
        }
    }
};

module.exports = {
    loginUser
};