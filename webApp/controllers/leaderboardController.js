const getListTDPs = async (req, res, db) => {
  const { pageNumber, limitNumber } = req.params;
  let lists = await db.query(`
            SELECT
            pl.userid,
            pl.totalprice,
            pl.name,
            pl.description,
            lc.listid,
            SUM(
              CASE
                WHEN cp.parttype = 0 THEN lc.quantity * (
                  SELECT tdp FROM cpu WHERE partid = lc.partid
                )
                WHEN cp.parttype = 4 THEN lc.quantity * (
                  SELECT tdp FROM gpu WHERE partid = lc.partid
                )
                ELSE 0
              END
            ) AS sum_tdp
          FROM listcontains lc
          JOIN computerpart cp ON lc.partid = cp.partid
          JOIN partslist pl ON lc.listid = pl.listid
          GROUP BY pl.userid, pl.totalprice, pl.name, pl.description, lc.listid
          ORDER BY sum_tdp DESC
          OFFSET $1 LIMIT $2;`, [pageNumber, limitNumber]);
    let listCount = await db.query(`
            SELECT COUNT(*) FROM partslist;`);
  try {
    return res.status(200).json({
      lists: lists?.rows,
      totalResultNum: listCount?.rows[0]?.count
  });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not access part lists.' });
  }
};

module.exports = {
    getListTDPs
};