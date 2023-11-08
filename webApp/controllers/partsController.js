
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
    let { partType, minPrice, maxPrice, orderBy, orderDir, pageNumber, limitNumber } = req.body;

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
            subquery = `
                SELECT * FROM computerpart 
                WHERE partid IN (SELECT partid FROM cpu)
                OR partid IN (SELECT partid FROM cpucooler)
                OR partid IN (SELECT partid FROM motherboard)
                OR partid IN (SELECT partid FROM ram)
                OR partid IN (SELECT partid FROM gpu)
                OR partid IN (SELECT partid FROM storage)
                OR partid IN (SELECT partid FROM tower)
                OR partid IN (SELECT partid FROM psu)
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
        // return list of distinct manufacturers where parttype = parttype
        let values = [];
        let query = `
            SELECT DISTINCT manufacturer FROM computerpart
        `;
        if (parttype !== null) {
            query += `WHERE parttype = $${values.length + 1} `;
            values.push(parttype);
        }
        query += `ORDER BY manufacturer ASC`;
        let results = await db.query(query, values);
        let manufacturers = results.rows.map(row => row.manufacturer);
        return res.status(200).json({
            manufacturers: manufacturers
        });

    } catch (e) {
        console.log(e);
        return res.status(404);
    }
};

module.exports = {
    browse,
    menuItems
};