const db = require('../../config/db');

async function reportIssue(data) {
    try {
        // Using pg-promise transaction
        const result = await db.tx(async t => {
            const {
                issueType,
                sacco,
                fareChange,
                selectedLatitude,
                selectedLongitude,
                details,
                contact,
                userAgent
            } = data;

            // Get sacco ID from middleware validation
            const saccoId = data.saccoId;

            // Using pg-promise one() method to insert and return data
            return await t.one(
                `INSERT INTO "Issues" (issue_type,
                                       sacco_id,
                                       fare_change_amount,
                                       new_stop_latitude,
                                       new_stop_longitude,
                                       details,
                                       contact,
                                       user_agent)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id, created_at`,
                [
                    issueType,
                    saccoId,
                    issueType === 'fare-change' ? parseFloat(fareChange) || null : null,
                    issueType === 'stop-moved' ? parseFloat(selectedLatitude) || null : null,
                    issueType === 'stop-moved' ? parseFloat(selectedLongitude) || null : null,
                    details || null,
                    contact || null,
                    userAgent || null
                ]
            );
        });

        return {
            success: true,
            message: 'Issue reported successfully',
            data: {
                issueId: result.id,
                createdAt: result.created_at
            }
        };

    } catch (error) {
        console.error('Error saving issue report:', error);

        return {
            error: 'Internal server error',
            message: 'Failed to save issue report'
        };
    }
}

module.exports = reportIssue;