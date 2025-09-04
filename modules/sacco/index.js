const db = require("../../config/db");

async function saccoDetails() {
    try {
        const query = `
            SELECT
                id as "SaccoId",
                sacco_name as "SaccoName",
                gps_location_latitude as "SaccoLatitude",
                gps_location_longitude as "SaccoLongitude"
            FROM "Sacco" S
        `;

        const data = await db.query(query);

        return data;
    } catch (e) {
        throw e;
    }
}

module.exports = saccoDetails;