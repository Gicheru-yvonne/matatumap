const db = require('../../config/db');

async function searchDestination(destination) {
    try {
        const query = `
            SELECT s.id                  AS "SaccoId",
                   s.sacco_name          AS "SaccoName",
                   s.destinations_served AS "DestinationServed",
                   s.fare_info           AS "Fare",
                   r.route_name          AS "RouteName",
                   r.route_long,
                   r.headsign,
                   s.gps_location_latitude,
                   s.gps_location_longitude,
                   COALESCE(
                                   json_agg(
                                   json_build_object(
                                           'IssueId', i.id,
                                           'IssueType', i.issue_type,
                                           'FareChangeAmount', i.fare_change_amount,
                                           'NewStopLatitude', i.new_stop_latitude,
                                           'NewStopLongitude', i.new_stop_longitude,
                                           'IssueDetails', i.details,
                                           'ReporterContact', i.contact,
                                           'IssueCreatedAt', i.created_at,
                                           'IssueUpdatedAt', i.updated_at
                                   ) ORDER BY i.created_at DESC
                                           ) FILTER (WHERE i.id IS NOT NULL),
                                   '[]'
                   )                     AS "Issues"
            FROM public."Sacco" s
                     JOIN public."Route" r
                          ON s.route_name = r.route_name
                     LEFT JOIN public."Issues" i
                               ON s.id = i.sacco_id
            WHERE LOWER(s.destinations_served) LIKE LOWER($1)
               OR LOWER(s.route_name) LIKE LOWER($1)
               OR LOWER(r.route_name) LIKE LOWER($1)
               OR LOWER(r.route_long) LIKE LOWER($1)
               OR LOWER(r.headsign) LIKE LOWER($1)
            GROUP BY s.id, s.sacco_name, s.destinations_served, s.fare_info,
                     r.route_name, r.route_long, r.headsign,
                     s.gps_location_latitude, s.gps_location_longitude
            ORDER BY s.sacco_name;
        `

        return await db.query(query, [`%${destination}%`]);
    } catch (e) {
        throw e;
    }
}

module.exports = searchDestination;