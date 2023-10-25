
const benchmarkPricePerf = async (req, res, db) => {
    let { partType, benchType, pageNumber, limitNumber } = req.body;

    pageNumber = parseInt(pageNumber);
    limitNumber = parseInt(limitNumber);
    pageNumber = Math.max(1, pageNumber);
    pageNumber = pageNumber - 1;
    pageNumber = pageNumber * limitNumber;

    try {

        let table = "";

        switch (partType) {
            case "GPU":
                table = "GPUPricePerformance";
                break;
            case "CPU":
                table = "CPUPricePerformance";
                break;
        }

        let benchmarks = await db.query(`
            SELECT * FROM ${table}
            WHERE benchmarktype = $1
            ORDER BY priceperformance desc
            OFFSET $2 LIMIT $3;
        `, [benchType, pageNumber, limitNumber]);

        let benchmarkCount = await db.query(`
            SELECT COUNT(*) FROM ${table}
            WHERE benchmarktype = $1;
        `, [benchType]);



        //return res.status(200).json(benchmarks?.rows);
        return res.status(200).json({
            benchmarks: benchmarks?.rows,
            totalResultNum: benchmarkCount?.rows[0]?.count
        });
    } catch (e){
        console.log(e);
        return res.status(404);
    }

};

module.exports = {
    benchmarkPricePerf
};