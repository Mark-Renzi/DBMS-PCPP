
const getLists = async (req, res, db) => {
    let userID = req.user.id;

    try {
        let lists = await db.query(`
            SELECT * FROM partslist
            WHERE userid = $1;
        `, [userID]);

        return res.status(200).json(lists?.rows);
    } catch (e){
        console.log(e);
        return res.status(404);
    }
};

module.exports = {
    getLists
};