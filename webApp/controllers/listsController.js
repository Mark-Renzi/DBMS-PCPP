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

const deleteList = async (req, res, db) => {
    const listid = req.params.listid;
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        let deleteQuery = await client.query('DELETE FROM partslist WHERE listid = $1;', [listid]);
        await client.query('COMMIT');
        return res.status(200).json(deleteQuery?.rows[0]);
    } catch(e) {
        console.log(e);
        client.query('ROLLBACK');
        return res.status(404);
    } finally {
        client.release();
    }
}

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

const addList = async (req, res, db) => {
    const userID = req.user.id;
    const { name, description } = req.body;
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

const editList = async (req, res, db) => {
    const listid = req.params.listid;
    const { name, description } = req.body;
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const newlistid = await client.query(
            'UPDATE partslist SET name = $2, description = $3 WHERE listid = $1 RETURNING *;'
        , [listid, name, description]);
        await client.query('COMMIT');
        return res.status(200).json(newlistid?.rows[0]);
    } catch (e){
        console.log(e);
        client.query('ROLLBACK');
        return res.status(404);
    } finally {
        client.release();
    }
}

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

const getListsWithPart = async (req, res, db) => {
  let partID = req.params.partid;

  try {
      let partslists = await db.query(`
        SELECT * FROM partslist
        WHERE listid IN (
            SELECT listid FROM listcontains
            WHERE partid = $1
        );      
      `, [partID]);
      console.log(partslists?.rows);
      return res.status(200).json(partslists?.rows);
  } catch (e){
      console.log(e);
      return res.status(404);
  }
};

const getPublicBuild = async (req, res, db) => {
  let listID = req.params.listid;

  try {
      let userBuild = await db.query(`
          SELECT totalprice, name, description FROM partslist
          WHERE listid = $1;
      `, [listID]);

      return res.status(200).json(userBuild?.rows[0]);
  } catch (e){
      console.log(e);
      return res.status(404);
  }
}

module.exports = {
    getLists,
    deleteList,
    getListInfo,
    editList,
    addList,
    getListTDP,
    getListsWithPart,
    getPublicBuild
};