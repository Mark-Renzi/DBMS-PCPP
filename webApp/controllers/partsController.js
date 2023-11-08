
const getTypeMapping = (partType) => {
    let parttype = null;
    switch (partType) {
        case "CPU":
            parttype = 0;
            break;
        case "CPUCooler":
            parttype = 1;
            break;
        case "Motherboard":
            parttype = 2;
            break;
        case "RAM":
            parttype = 3;
            break;
        case "GPU":
            parttype = 4;
            break;
        case "Storage":
            parttype = 5;
            break;
        case "Tower":
            parttype = 6;
            break;
        case "PSU":
            parttype = 7;
            break;
        default:
            partType = null;
            parttype = null;
    }
    return [parttype, partType];
}

const browse = async (req, res, db) => {
    let { partType, minPrice, maxPrice, manufacturers, orderBy, orderDir, pageNumber, limitNumber } = req.body;

    pageNumber = parseInt(pageNumber);
    limitNumber = parseInt(limitNumber);
    pageNumber = Math.max(1, pageNumber);
    pageNumber = pageNumber - 1;
    pageNumber = pageNumber * limitNumber;

    let subquery = ``;
    let conditions = [];
    let values = [];

    try {

        let parttype = null;

        [parttype, partType] = getTypeMapping(partType);

        if (parttype !== null && parttype >= 0 && parttype <= 7) {
            conditions.push(`parttype = $${values.length + 1}`);
            values.push(parttype);
            subquery = `
                SELECT * FROM computerpart, ${partType}
                WHERE computerpart.partid = ${partType}.partid
            `;
        } else {
            // subquery = `
            //     SELECT * FROM computerpart
            //     LEFT JOIN cpu ON computerpart.partid = cpu.partid
            //     LEFT JOIN cpucooler ON computerpart.partid = cpucooler.partid
            //     LEFT JOIN motherboard ON computerpart.partid = motherboard.partid
            //     LEFT JOIN ram ON computerpart.partid = ram.partid
            //     LEFT JOIN gpu ON computerpart.partid = gpu.partid
            //     LEFT JOIN storage ON computerpart.partid = storage.partid
            //     LEFT JOIN tower ON computerpart.partid = tower.partid
            //     LEFT JOIN psu ON computerpart.partid = psu.partid
            //     WHERE parttype IS NOT NULL
            // `;
            subquery = `
                SELECT * FROM computerpart
                WHERE parttype IS NOT NULL
            `;
        }

        if (minPrice && maxPrice) {
            conditions.push(`price BETWEEN $${values.length + 1} AND $${values.length + 2}`);
            values.push(minPrice);
            values.push(maxPrice);
        } else if (minPrice) {
            conditions.push(`price >= $${values.length + 1}`);
            values.push(minPrice);
        } else if (maxPrice) {
            conditions.push(`price <= $${values.length + 1}`);
            values.push(maxPrice);
        }

        if (manufacturers && manufacturers.length > 0) {
            let manufacturerConditions = [];
            for (let i = 0; i < manufacturers.length; i++) {
                manufacturerConditions.push(`manufacturer = $${values.length + 1}`);
                values.push(manufacturers[i]);
            }
            conditions.push(`(${manufacturerConditions.join(' OR ')})`);
        }
        

        if (conditions.length > 0) {
            subquery += ` AND ${conditions.join(' AND ')}`;
        }

        let resultCountQuery = `
            SELECT COUNT(*) FROM (${subquery}) AS subquery
        `;

        let resultCount = await db.query(resultCountQuery, values);

        // Ensure orderBy is a valid column name
        const validColumns = ['price', 'manufacturer', 'model'];
        if (!validColumns.includes(orderBy)) {
            throw new Error('Invalid order by column');
        }

        // Ensure orderDir is either 'ASC' or 'DESC'
        if (!['ASC', 'DESC'].includes(orderDir)) {
            throw new Error('Invalid order direction');
        }

        let resultQuery = `
            SELECT * FROM (${subquery}) AS subquery
            ORDER BY "${orderBy}" ${orderDir} 
            LIMIT $${values.length + 1}
            OFFSET $${values.length + 2}
        `;

        values.push(limitNumber);
        values.push(pageNumber);

        let results = await db.query(resultQuery, values);




        //return res.status(200).json(benchmarks?.rows);
        return res.status(200).json({
            partslist: results?.rows,
            totalResultNum: resultCount?.rows[0]?.count
        });
    } catch (e){
        console.log(e);
        return res.status(404);
    }

};

const menuItems = async (req, res, db) => {

    let { partType } = req.body;

    let parttype = null;
    [parttype, partType] = getTypeMapping(partType);

    try {
        // Initialize an array to hold parameterized values for the query
        let values = [];
        let query = `
            SELECT DISTINCT manufacturer, MAX(price) AS highest_price, MIN(price) AS lowest_price FROM computerpart
        `;
        if (parttype !== null) {
            query += `WHERE parttype = $${values.length + 1} `;
            values.push(parttype);
        }
        query += `GROUP BY manufacturer ORDER BY manufacturer ASC`;
        
        let results = await db.query(query, values);

        // Extract manufacturers and price range
        let manufacturers = results.rows.map(row => row.manufacturer);
        let prices = results.rows.reduce((acc, row) => {
            acc.highest = Math.max(acc.highest, row.highest_price);
            acc.lowest = Math.min(acc.lowest, row.lowest_price);
            return acc;
        }, { highest: 0, lowest: Number.MAX_VALUE });

        let options = {
            "categorical": {
                "manufacturers": manufacturers
            },
            "numerical": {
                "price": [prices.lowest, prices.highest]
            }
        };

        if (parttype === 0) {
            let [coresResult, clockResult, tdpResult, graphicsResult, socketResult] = await Promise.all([
                db.query('SELECT MAX(cores) AS max_cores, MIN(cores) AS min_cores FROM cpu'),
                db.query('SELECT MAX(boostclock) AS max_boostclock, MIN(boostclock) AS min_boostclock, MAX(coreclock) AS max_coreclock, MIN(coreclock) AS min_coreclock FROM cpu'),
                db.query('SELECT MAX(tdp) AS max_tdp, MIN(tdp) AS min_tdp FROM cpu'),
                db.query('SELECT DISTINCT graphics FROM cpu'),
                db.query('SELECT DISTINCT socket FROM cpu')
            ]);

            options.numerical.cores = [coresResult.rows[0].min_cores, coresResult.rows[0].max_cores];
            options.numerical.boostclock = [clockResult.rows[0].min_boostclock, clockResult.rows[0].max_boostclock];
            options.numerical.coreclock = [clockResult.rows[0].min_coreclock, clockResult.rows[0].max_coreclock];
            options.numerical.tdp = [tdpResult.rows[0].min_tdp, tdpResult.rows[0].max_tdp];

            options.categorical.graphics = graphicsResult.rows.filter(row => row.graphics !== null).map(row => row.graphics);
            options.categorical.socket = socketResult.rows.filter(row => row.socket !== null).map(row => row.socket);
        }

        return res.status(200).json(options);

    } catch (e) {
        console.log(e);
        return res.status(404).send('Error retrieving data');
    }
};

module.exports = {
    browse,
    menuItems
};