const getParts = async (req, res, db, listid) => {
    try {
        const tables = {
            0: 'CPU',
            1: 'CPUCooler',
            2: 'Motherboard',
            3: 'RAM',
            4: 'GPU',
            5: 'Storage',
            6: 'Tower',
            7: 'PSU',
        };

        const parts = [];

        for (let i = 0; i < Object.keys(tables).length; i++) {
            //SELECT * FROM listcontains where listid = 'acabfdeb-b8a8-4ac4-9d45-6573071e5821' AND type = 0;
            const item = await db.query(`SELECT * FROM listcontains WHERE listid = $1 AND type = $2`, [listid, i]);

            if (item.rows.length === 0) {
                parts.push({});
                continue;
            }

            const partID = item.rows[0].partid;
            const type = item.rows[0].type;

            const computerpart = await db.query(`SELECT * FROM ComputerPart WHERE partID = $1`, [partID]);

            if (computerpart.rows.length > 0) {
                const {partid, price, manufacturer, model } = computerpart.rows[0];
                parts.push({partid: partid, price: price, manufacturer: manufacturer, model:model, type:type});
              } else {
                parts.push({});
              }
        }

        return res.status(200).json(parts);
    } catch (e) {
        console.log(e);
        return res.status(404);
    }
};

module.exports = {
    getParts
};
