
const benchmarkPricePerf = async (req, res, db) => {
    const { partType, benchType, pageNumber, limitNumber } = req.body;

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
            ORDER BY score desc
            OFFSET $2 LIMIT $3;
        `, [benchType, pageNumber, limitNumber]);

        return res.status(200).json(benchmarks?.rows);
    } catch (e){
        console.log(e);
        return res.status(404);
    }

};

module.exports = {
    benchmarkPricePerf
};