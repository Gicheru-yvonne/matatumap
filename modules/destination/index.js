const db = require('../../config/db');

async function searchDestination(destination) {
    try {
        const query = `
            SELECT 
                S.id as "SaccoId",
                "sacco name" as "SaccoName", 
                "destinations served" as "DestinationServed",
                "fare info" as "Fare",
                SR.route_name as "RouteName"
            FROM "Sacco" S
            JOIN "SaccosRoutes" SR ON S.id = SR.sacco_id
            WHERE "destinations served" ilike $1`

        return await db.query(query, [`%${destination}%`]);
    } catch (e) {
        throw e;
    }
}

module.exports = searchDestination;