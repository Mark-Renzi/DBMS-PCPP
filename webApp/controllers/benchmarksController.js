

// basic response to a post requst
const benchmarkPricePerf = async (req, res, db) => {
    const { partType, benchType } = req.body;

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
            SELECT * FROM $1
            WHERE benchmark.type = $2
            SORT BY score desc
            LIMIT 100;
        `, [table, benchType]);

        return res.status(200).json(benchmarks?.rows);
    } catch {
        return res.status(404);
    }

};