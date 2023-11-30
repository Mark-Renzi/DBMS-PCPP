const partTables = ["CPU", "CPUCooler", "Motherboard", "ram", "GPU", "Storage", "Tower", "PSU"];

const browse = async (req, res, db) => {
    let { partType, minPrice, maxPrice, manufacturers, orderBy, orderDir, pageNumber, limitNumber, dynamicFilters } = req.body;

    pageNumber = parseInt(pageNumber);
    limitNumber = parseInt(limitNumber);
    pageNumber = Math.max(1, pageNumber);
    pageNumber = pageNumber - 1;
    pageNumber = pageNumber * limitNumber;

    let subquery = ``;
    let conditions = [];
    let values = [];

    // console.log(req.body.dynamicFilters)

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

        if (dynamicFilters && Object.keys(dynamicFilters).length > 0) {
            Object.entries(dynamicFilters).forEach(([filterType, filters]) => {
                Object.entries(filters).forEach(([filterKey, filterValue]) => {
                    if (validColumnNames[partType] && validColumnNames[partType].includes(filterKey)) {
                        if (filterType === 'numerical' && filterValue.length === 2) {
                            conditions.push(`${filterKey} BETWEEN $${values.length + 1} AND $${values.length + 2}`);
                            values.push(filterValue[0], filterValue[1]);
                        } else if (filterType === 'categorical' && filterValue.length > 0) {
                            let categoricalConditions = filterValue.map(value => {
                                values.push(value);
                                return `${filterKey} = $${values.length}`;
                            });
                            conditions.push(`(${categoricalConditions.join(' OR ')})`);
                        }
                    } else {
                        console.log(`Invalid filter key: ${filterKey}`);
                        return res.status(403).send('Forbidden - You do not have permission to access this resource.');
                    }
                });
            });
        }

        if (conditions.length > 0) {
            subquery += ` AND ${conditions.join(' AND ')}`;
        }

        console.log(subquery)
        console.log(values)

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

        options = await getDynamicOptions(parttype, db, options);

        return res.status(200).json(options);

    } catch (e) {
        console.log(e);
        return res.status(404).send('Error retrieving data');
    }
};

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

const validColumnNames = {
    'CPU': ['cores', 'boostclock', 'coreclock', 'tdp', 'graphics', 'socket'],
    'CPUCooler': ['size', 'rpm_max', 'rpm_min', 'noiselevel_max', 'noiselevel_min', 'color'],
    'Motherboard': ['maxmemory', 'memoryslots', 'formfactor', 'socket', 'color'],
    'RAM': ['totalcapacity', 'mhz', 'pricepergb', 'color', 'ddr', 'count', 'capacity'],
    'GPU': ['coreclock', 'boostclock', 'length', 'chipset', 'memory', 'tdp', 'color'],
    'Storage': ['capacity', 'pricepergb', 'cache', 'formfactor', 'type', 'interface'],
    'Tower': ['color', 'formfactor', 'sidepanel'],
    'PSU': ['wattage', 'color', 'modular', 'efficiency', 'formfactor']
};

const getDynamicOptions = async (parttype, db, options) => {
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
    } else if (parttype === 1) {
        // CPU Cooler
        // numerical: size, rpm_min, rpm_max, noiselevel_min, noiselevel_max
        // categorical: color
        let [sizeResult, rpmMaxResult, rpmMinResult, noiselevelMaxResult, noiseLevelMinResult, colorResult] = await Promise.all([
            db.query('SELECT MAX(size) AS max_size, MIN(size) AS min_size FROM cpucooler'),
            db.query('SELECT MAX(rpm_max) AS rpm_max_max, MIN(rpm_max) AS rpm_max_min FROM cpucooler'),
            db.query('SELECT MAX(rpm_min) AS rpm_min_max, MIN(rpm_min) AS rpm_min_min FROM cpucooler'),
            db.query('SELECT MAX(noiselevel_max) AS noiselevel_max_max, MIN(noiselevel_max) AS noiselevel_max_min FROM cpucooler'),
            db.query('SELECT MAX(noiselevel_min) AS noiselevel_min_max, MIN(noiselevel_min) AS noiselevel_min_min FROM cpucooler'),
            db.query('SELECT DISTINCT color FROM cpucooler')
        ]);

        options.numerical.size = [sizeResult.rows[0].min_size, sizeResult.rows[0].max_size];
        options.numerical.rpm_max = [rpmMaxResult.rows[0].rpm_max_min, rpmMaxResult.rows[0].rpm_max_max];
        options.numerical.rpm_min = [rpmMinResult.rows[0].rpm_min_min, rpmMinResult.rows[0].rpm_min_max];
        options.numerical.noiselevel_max = [noiselevelMaxResult.rows[0].noiselevel_max_min, noiselevelMaxResult.rows[0].noiselevel_max_max];
        options.numerical.noiselevel_min = [noiseLevelMinResult.rows[0].noiselevel_min_min, noiseLevelMinResult.rows[0].noiselevel_min_max];

        options.categorical.color = colorResult.rows.filter(row => row.color !== null).map(row => row.color);
    } else if (parttype === 2) {
        // Motherboard
        // numerical: maxmemory, memoryslots
        // categorical: formfactor, socket, color
    
        let [maxMemoryResult, memorySlotsResult, formFactorResult, socketResult, colorResult] = await Promise.all([
            db.query('SELECT MAX(maxmemory) AS max_maxmemory, MIN(maxmemory) AS min_maxmemory FROM motherboard'),
            db.query('SELECT MAX(memoryslots) AS max_memoryslots, MIN(memoryslots) AS min_memoryslots FROM motherboard'),
            db.query('SELECT DISTINCT formfactor FROM motherboard'),
            db.query('SELECT DISTINCT socket FROM motherboard'),
            db.query('SELECT DISTINCT color FROM motherboard')
        ]);

        options.numerical.maxmemory = [maxMemoryResult.rows[0].min_maxmemory, maxMemoryResult.rows[0].max_maxmemory];
        options.numerical.memoryslots = [memorySlotsResult.rows[0].min_memoryslots, memorySlotsResult.rows[0].max_memoryslots];

        options.categorical.formfactor = formFactorResult.rows.filter(row => row.formfactor !== null).map(row => row.formfactor);
        options.categorical.socket = socketResult.rows.filter(row => row.socket !== null).map(row => row.socket);
        options.categorical.color = colorResult.rows.filter(row => row.color !== null).map(row => row.color);
    } else if (parttype === 3) {
        // RAM
        // numerical: totalcapacity, MHz, pricepergb
        // categorical: color, ddr, count, capacity

        let [totalCapacityResult, MHzResult, pricePerGbResult, colorResult, ddrResult, countResult, capacityResult] = await Promise.all([
            db.query('SELECT MAX(totalcapacity) AS max_totalcapacity, MIN(totalcapacity) AS min_totalcapacity FROM ram'),
            db.query('SELECT MAX(mhz) AS max_mhz, MIN(mhz) AS min_mhz FROM ram'),
            db.query('SELECT MAX(pricepergb) AS max_pricepergb, MIN(pricepergb) AS min_pricepergb FROM ram'),
            db.query('SELECT DISTINCT color FROM ram'),
            db.query('SELECT DISTINCT ddr FROM ram'),
            db.query('SELECT DISTINCT count FROM ram'),
            db.query('SELECT DISTINCT capacity FROM ram')
        ]);

        options.numerical.totalcapacity = [totalCapacityResult.rows[0].min_totalcapacity, totalCapacityResult.rows[0].max_totalcapacity];
        options.numerical.mhz = [MHzResult.rows[0].min_mhz, MHzResult.rows[0].max_mhz];
        options.numerical.pricepergb = [pricePerGbResult.rows[0].min_pricepergb, pricePerGbResult.rows[0].max_pricepergb];

        options.categorical.color = colorResult.rows.filter(row => row.color !== null).map(row => row.color);
        options.categorical.ddr = ddrResult.rows.filter(row => row.ddr !== null).map(row => row.ddr);
        options.categorical.count = countResult.rows.filter(row => row.count !== null).map(row => row.count);
        options.categorical.capacity = capacityResult.rows.filter(row => row.capacity !== null).map(row => row.capacity);
    } else if (parttype === 4) {
        // GPU
        // numerical: coreclock, boostclock, length
        // categorical: chipset, memory, tdp, color

        let [coreClockResult, boostClockResult, lengthResult, chipsetResult, memoryResult, tdpResult, colorResult] = await Promise.all([
            db.query('SELECT MAX(coreclock) AS max_coreclock, MIN(coreclock) AS min_coreclock FROM gpu'),
            db.query('SELECT MAX(boostclock) AS max_boostclock, MIN(boostclock) AS min_boostclock FROM gpu'),
            db.query('SELECT MAX(length) AS max_length, MIN(length) AS min_length FROM gpu'),
            db.query('SELECT DISTINCT chipset FROM gpu'),
            db.query('SELECT DISTINCT memory FROM gpu'),
            db.query('SELECT DISTINCT tdp FROM gpu'),
            db.query('SELECT DISTINCT color FROM gpu')
        ]);

        options.numerical.coreclock = [coreClockResult.rows[0].min_coreclock, coreClockResult.rows[0].max_coreclock];
        options.numerical.boostclock = [boostClockResult.rows[0].min_boostclock, boostClockResult.rows[0].max_boostclock];
        options.numerical.length = [lengthResult.rows[0].min_length, lengthResult.rows[0].max_length];

        options.categorical.chipset = chipsetResult.rows.filter(row => row.chipset !== null).map(row => row.chipset);
        options.categorical.memory = memoryResult.rows.filter(row => row.memory !== null).map(row => row.memory);
        options.categorical.tdp = tdpResult.rows.filter(row => row.tdp !== null).map(row => row.tdp);
        options.categorical.color = colorResult.rows.filter(row => row.color !== null).map(row => row.color);
    } else if (parttype === 5) {
        // Storage
        // numerical: capacity, pricepergb, cache
        // categorical: formfactor, type, interface

        let [capacityResult, pricePerGbResult, cacheResult, formFactorResult, typeResult, interfaceResult] = await Promise.all([
            db.query('SELECT MAX(capacity) AS max_capacity, MIN(capacity) AS min_capacity FROM storage'),
            db.query('SELECT MAX(pricepergb) AS max_pricepergb, MIN(pricepergb) AS min_pricepergb FROM storage'),
            db.query('SELECT MAX(cache) AS max_cache, MIN(cache) AS min_cache FROM storage'),
            db.query('SELECT DISTINCT formfactor FROM storage'),
            db.query('SELECT DISTINCT type FROM storage'),
            db.query('SELECT DISTINCT interface FROM storage')
        ]);

        options.numerical.capacity = [capacityResult.rows[0].min_capacity, capacityResult.rows[0].max_capacity];
        options.numerical.pricepergb = [pricePerGbResult.rows[0].min_pricepergb, pricePerGbResult.rows[0].max_pricepergb];
        options.numerical.cache = [cacheResult.rows[0].min_cache, cacheResult.rows[0].max_cache];

        options.categorical.formfactor = formFactorResult.rows.filter(row => row.formfactor !== null).map(row => row.formfactor);
        options.categorical.type = typeResult.rows.filter(row => row.type !== null).map(row => row.type);
        options.categorical.interface = interfaceResult.rows.filter(row => row.interface !== null).map(row => row.interface);
    } else if (parttype === 6) {
        // Tower
        // numerical: 
        // categorical: color, formfactor, sidepanel

        let [colorResult, formFactorResult, sidePanelResult] = await Promise.all([
            db.query('SELECT DISTINCT color FROM tower'),
            db.query('SELECT DISTINCT formfactor FROM tower'),
            db.query('SELECT DISTINCT sidepanel FROM tower')
        ]);

        options.categorical.color = colorResult.rows.filter(row => row.color !== null).map(row => row.color);
        options.categorical.formfactor = formFactorResult.rows.filter(row => row.formfactor !== null).map(row => row.formfactor);
        options.categorical.sidepanel = sidePanelResult.rows.filter(row => row.sidepanel !== null).map(row => row.sidepanel);
    } else if (parttype === 7) {
        // PSU
        // numerical: wattage
        // categorical: color, modular, efficiency, formfactor

        let [wattageResult, colorResult, modularResult, efficiencyResult, formFactorResult] = await Promise.all([
            db.query('SELECT MAX(wattage) AS max_wattage, MIN(wattage) AS min_wattage FROM psu'),
            db.query('SELECT DISTINCT color FROM psu'),
            db.query('SELECT DISTINCT modular FROM psu'),
            db.query('SELECT DISTINCT efficiency FROM psu'),
            db.query('SELECT DISTINCT formfactor FROM psu')
        ]);

        options.numerical.wattage = [wattageResult.rows[0].min_wattage, wattageResult.rows[0].max_wattage];

        options.categorical.color = colorResult.rows.filter(row => row.color !== null).map(row => row.color);
        options.categorical.modular = modularResult.rows.filter(row => row.modular !== null).map(row => row.modular);
        options.categorical.efficiency = efficiencyResult.rows.filter(row => row.efficiency !== null).map(row => row.efficiency);
        options.categorical.formfactor = formFactorResult.rows.filter(row => row.formfactor !== null).map(row => row.formfactor);
    }

    return options;
}

const getPartDetails = async (req, res, db) => {
    let partID = req.params.partid;

    try {
        let type = await db.query(`
            SELECT parttype FROM computerpart WHERE partid = $1
        `, [partID]);
        let partType = partTables[type?.rows[0]?.parttype];

        let partDetails = await db.query(`
            SELECT * FROM computerpart, ${partType}
            WHERE computerpart.partid = ${partType}.partid AND computerpart.partid = $1
        `, [partID]);
        return res.status(200).json(partDetails?.rows[0]);
    } catch (e){
        console.log(e);
        return res.status(404);
    }
};

module.exports = {
    browse,
    menuItems,
    getPartDetails
};