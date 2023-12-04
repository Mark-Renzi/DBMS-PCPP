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

const getListScores = async (req, res, db) => {
  let { pageNumber, limitNumber, cpuBenchType, gpuBenchType } = req.body;

  pageNumber = parseInt(pageNumber);
  limitNumber = parseInt(limitNumber);
  pageNumber = Math.max(1, pageNumber);
  pageNumber = pageNumber - 1;
  pageNumber = pageNumber * limitNumber;
  
  let lists = await db.query(`
    SELECT
        userid,
        totalprice,
        name,
        description,
        listid,
        SUM(score) AS listscore
    FROM (
        SELECT
            pl.userid,
            pl.totalprice,
            pl.name,
            pl.description,
            lc.listid,
            benchmark.score
        FROM
            listcontains lc
            JOIN computerpart cp ON lc.partid = cp.partid
            JOIN partslist pl ON lc.listid = pl.listid
            JOIN cpu ON cpu.partid = cp.partid
            JOIN benchmark ON benchmark.chipsetid = cpu.chipsetid
        WHERE
            benchmark.type = $1
        GROUP BY
            pl.userid, pl.totalprice, pl.name, pl.description, lc.listid, cpu.chipsetid, benchmark.score

        UNION ALL

        SELECT
            pl.userid,
            pl.totalprice,
            pl.name,
            pl.description,
            lc.listid,
            benchmark.score
        FROM
            listcontains lc
            JOIN computerpart cp ON lc.partid = cp.partid
            JOIN partslist pl ON lc.listid = pl.listid
            JOIN gpu ON gpu.partid = cp.partid
            JOIN benchmark ON benchmark.chipsetid = gpu.chipsetid
        WHERE
            benchmark.type = $2
        GROUP BY
            pl.userid, pl.totalprice, pl.name, pl.description, lc.listid, benchmark.score
    ) AS scores
    GROUP BY
        userid, totalprice, name, description, listid
    ORDER BY listscore DESC
    OFFSET $3 LIMIT $4;`, [cpuBenchType, gpuBenchType, pageNumber, limitNumber]);
    let listCount = await db.query(`
        SELECT COUNT(*) FROM partslist;`);
        
        try {
          return res.status(200).json({
            lists: lists?.rows,
            totalResultNum: listCount?.rows[0]?.count
        });}catch (e) {
    console.log(e);
    return res.status(500);
  }
};

module.exports = {
    getListTDPs,
    getListScores
};