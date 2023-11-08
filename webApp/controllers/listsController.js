
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

const getListInfo = async (req, res, db) => {
    let listID = req.params.listid;

    try {
        let listInfo = await db.query(`
            SELECT * FROM partslist
            WHERE listid = $1;
        `, [listID]);

        return res.status(200).json(listInfo?.rows[0]);
    } catch (e){
        console.log(e);
        return res.status(404);
    }
}

const addList = async (name, description, req, res, db) => {
    let userID = req.user.id;
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const newlistid = await client.query(
            'INSERT INTO partslist (userid, totalprice, name, description) VALUES ($1, $2, $3, $4) RETURNING *;'
        , [userID, 0, name, description]);
        await client.query('COMMIT');
        return res.status(200).json(newlistid?.rows[0]);
    } catch (e){
        console.log(e);
        client.query('ROLLBACK');
        return res.status(404);
    } finally {
        client.release();
    }
};

const getListTDP = async (req, res, db) => {
    let listID = req.params.listid;
    try {
        let listTDP = await db.query(`
            SELECT SUM(tdp) AS sum_tdp, SUM(psu_wattage) AS wattage
            FROM (
              SELECT
                lc.listid,
                lc.partid,
                lc.quantity,
                cp.parttype,
                (
                  CASE
                    WHEN cp.parttype = 0 THEN lc.quantity * (
                      SELECT tdp FROM cpu WHERE partid = lc.partid
                    )
                    WHEN cp.parttype = 4 THEN lc.quantity * (
                      SELECT tdp FROM gpu WHERE partid = lc.partid
                    )
                    ELSE 0
                  END
                ) AS tdp,
                (
                  CASE
                    WHEN cp.parttype = 7 THEN lc.quantity * (
                      SELECT wattage FROM psu WHERE partid = lc.partid
                    )
                    ELSE 0
                  END
                ) AS psu_wattage
              FROM listcontains lc
              JOIN computerpart cp ON lc.partid = cp.partid
              WHERE lc.listid = $1
            ) AS list_tdp;
        `, [listID]);
        return res.status(200).json(listTDP?.rows[0]);
    } catch (e){
        console.log(e);
        return res.status(404);
    }
}

module.exports = {
    getLists,
    getListInfo,
    addList,
    getListTDP
};