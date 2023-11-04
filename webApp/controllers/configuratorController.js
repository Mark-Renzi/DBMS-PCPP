const getParts = async (req, res, db) => {
    const listid = req.params.listid;
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

const addPart = async (req, res, db) => {
    const { listid } = req.params;
    const { partid } = req.body;
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            INSERT INTO listcontains (listid, partid, quantity)
            VALUES ($1, $2, 0)
        `, [listid, partid]);

        await client.query('COMMIT');
        return res.status(200).send('OK');
    } catch (e) {
        console.log(e);
        await client.query('ROLLBACK');
        return res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
};

const deletePart = async (req, res, db) => {
    const { listid } = req.params;
    const { partid } = req.body;
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            DELETE FROM listcontains
            WHERE listid = $1 AND partid = $2
        `, [listid, partid]);

        await client.query('COMMIT');
        return res.status(200).send('OK');
    } catch (e) {
        console.log(e);
        await client.query('ROLLBACK');
        return res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
};

module.exports = {
    getParts,
    addPart,
    deletePart
};
