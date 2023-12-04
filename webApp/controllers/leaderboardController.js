const getListTDPs = async (req, res, db) => {
  let { pageNumber, limitNumber } = req.body;

  pageNumber = parseInt(pageNumber);
  limitNumber = parseInt(limitNumber);
  pageNumber = Math.max(1, pageNumber);
  pageNumber = pageNumber - 1;
  pageNumber = pageNumber * limitNumber;
  
  let lists = await db.query(`
            SELECT
              pl.userid,
              pl.totalprice,
              pl.name,
              pl.description,
              pl.listid,
              COALESCE(SUM(
                CASE
                  WHEN cp.parttype = 0 THEN lc.quantity * COALESCE(c.tdp, 0)
                  WHEN cp.parttype = 4 THEN lc.quantity * COALESCE(g.tdp, 0)
                  ELSE 0
                END
              ), 0) AS sum_tdp
            FROM partslist pl
            LEFT JOIN listcontains lc ON pl.listid = lc.listid
            LEFT JOIN computerpart cp ON lc.partid = cp.partid
            LEFT JOIN cpu c ON cp.partid = c.partid
            LEFT JOIN gpu g ON cp.partid = g.partid
            GROUP BY pl.userid, pl.totalprice, pl.name, pl.description, pl.listid
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

const getListScores = async (req, res, db) => {
  let { pageNumber, limitNumber, cpuBenchType, gpuBenchType } = req.body;

  pageNumber = parseInt(pageNumber);
  limitNumber = parseInt(limitNumber);
  pageNumber = Math.max(1, pageNumber);
  pageNumber = pageNumber - 1;
  pageNumber = pageNumber * limitNumber;
  
  let lists = await db.query(`
    SELECT
        pl.userid,
        pl.totalprice,
        pl.name,
        pl.description,
        pl.listid,
        COALESCE(SUM(benchmark.score), 0) AS listscore
    FROM partslist pl
    LEFT JOIN listcontains lc ON pl.listid = lc.listid
    LEFT JOIN computerpart cp ON lc.partid = cp.partid
    LEFT JOIN (
        SELECT cpu.partid, b.score FROM cpu
        JOIN benchmark b ON b.chipsetid = cpu.chipsetid AND b.type = $1
        UNION ALL
        SELECT gpu.partid, b.score FROM gpu
        JOIN benchmark b ON b.chipsetid = gpu.chipsetid AND b.type = $2
    ) AS benchmark ON benchmark.partid = cp.partid
    GROUP BY pl.userid, pl.totalprice, pl.name, pl.description, pl.listid
    ORDER BY listscore DESC
    OFFSET $3 LIMIT $4;`, [cpuBenchType, gpuBenchType, pageNumber, limitNumber]);

  let listCount = await db.query(`
    SELECT COUNT(*) FROM partslist;`);
  
  try {
    return res.status(200).json({
      lists: lists?.rows,
      totalResultNum: listCount?.rows[0]?.count
    });
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
};


module.exports = {
    getListTDPs,
    getListScores
};