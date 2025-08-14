const db = require("../../config/db");

async function routeDetails({ saccoId, route }) {
    try {
        const query = `
            SELECT
            ST_AsGeoJSON(R.geom) AS geometry,
            S."sacco name" AS "SaccoName",
            S."_gps location_latitude" AS "SaccoLatitude",
            S."_gps location_longitude" AS "SaccoLongitude",
            R.route_name AS "RouteName"
            FROM "Route" R
            JOIN "SaccosRoutes" SR ON R.route_name = SR.route_name
            JOIN "Sacco" S ON SR.sacco_id = S.id
            WHERE R.route_name = $1
            AND S.id = $2
        `;

        const data = await db.oneOrNone(query, [route.toString(), +saccoId]);

        if (!data) {
            throw new Error("Route not found");
        }

        data.geometry = JSON.parse(data.geometry);

        return data;
    } catch (e) {
        throw e;
    }
}

module.exports = routeDetails;