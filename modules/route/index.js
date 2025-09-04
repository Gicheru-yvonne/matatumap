const db = require("../../config/db");

async function routeDetails({ saccoId, route }) {
    try {
        const query = `
            SELECT
            ST_AsGeoJSON(R.geom) AS geometry,
            S."sacco_name" AS "SaccoName",
            S."gps_location_latitude" AS "SaccoLatitude",
            S."gps_location_longitude" AS "SaccoLongitude",
            R.route_name AS "RouteName"
            FROM "Route" R
            JOIN "Sacco" S ON S.route_name = R.route_name
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