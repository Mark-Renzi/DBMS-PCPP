const benchmarkPerfRatio = async (req, res, db) => {
    let { comparisonType, partType, benchType, pageNumber, limitNumber } = req.body;

    pageNumber = parseInt(pageNumber);
    limitNumber = parseInt(limitNumber);
    pageNumber = Math.max(1, pageNumber);
    pageNumber = pageNumber - 1;
    pageNumber = pageNumber * limitNumber;

    try {

        let table = "";

        switch (partType) {
            case "GPU":
                if (comparisonType === "Price") {
                    table = "GPUPricePerformance";
                }
                else {
                    table = "GPUTDPPerformance";
                }
                break;
            case "CPU":
                if (comparisonType === "Price") {
                    table = "CPUPricePerformance";
                }
                else {
                    table = "CPUTDPPerformance";
                }
                break;
        }

        let benchmarks = await db.query(`
            SELECT * FROM ${table}
            WHERE benchmarktype = $1
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

const getBenchmarks = async (req, res, db) => {
    let chipsetID = req.params.chipsetid;

    try {
        let benchmarks = await db.query(`
            SELECT * FROM benchmark WHERE chipsetid = $1
        `, [chipsetID]);
        return res.status(200).json(benchmarks?.rows);
    } catch (e){
        console.log(e);
        return res.status(404);
    }
};

module.exports = {
    benchmarkPerfRatio,
    getBenchmarks
};