const getParts = async (req, res, db, listid) => {
    try {
        const tables = {
            0: 'cpu',
            1: 'cpucooler',
            2: 'motherboard',
            3: 'ram',
            4: 'gpu',
            5: 'storage',
            6: 'tower',
            7: 'psu',
        };

        const listItemsQuery = `
            SELECT lc.quantity, cp.partid, cp.price, cp.manufacturer, cp.model, cp.parttype 
            FROM listcontains lc
            INNER JOIN computerpart cp ON lc.partid = cp.partid
            WHERE lc.listid = $1
        `;
        const listItemsResult = await db.query(listItemsQuery, [listid]);

        const partsDetails = await Promise.all(listItemsResult.rows.map(async (item) => {
            const partTypeTable = tables[item.parttype];
            if (partTypeTable) {
                const partDetailsQuery = `
                    SELECT * FROM ${partTypeTable}
                    WHERE partid = $1
                `;
                const partDetailsResult = await db.query(partDetailsQuery, [item.partid]);
                partDetailsResult.rows[0].type = item.parttype;
                return { ...item, ...partDetailsResult.rows[0] };
            }
            return item;
        }));

        return res.status(200).json(partsDetails);
    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getParts
};
