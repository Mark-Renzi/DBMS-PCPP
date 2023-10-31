
const getLists = async (req, res, db) => {
    let userID = req.user.id;

    try {
        let lists = await db.query(`
            SELECT * FROM partslist
            WHERE userid = $1;
        `, [userID]);

        return res.status(200).json(lists?.rows);
    } catch (e){
        console.log(e);
        return res.status(404);
    }
};

const addList = async (name, description, req, res, db) => {
    let userID = req.user.id;
    const client = await db.connect();
    try {
        client.query('BEGIN');
        client.query(
            'INSERT INTO partslist (userid, totalprice, name, description) VALUES ($1, $2, $3, $4);'
        , [userID, 0, name, description]);
        client.query('COMMIT');
        return res.status(200);
    } catch (e){
        console.log(e);
        client.query('ROLLBACK');
        return res.status(404);
    } finally {
        client.release();
    }
};

module.exports = {
    getLists, addList
};