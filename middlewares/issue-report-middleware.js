const db = require("../config/db");

const issueReportMiddleware = async (req, res, next) => {
    const { issueType, sacco } = req.body;

    if (!issueType || !sacco) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'issueType and sacco are required'
        });
    }

    const validIssueTypes = ['matatu-full', 'fare-change', 'stop-moved'];
    if (!validIssueTypes.includes(issueType)) {
        return res.status(400).json({
            error: 'Invalid issue type',
            message: 'issueType must be one of: ' + validIssueTypes.join(', ')
        });
    }

    try {
        const saccoData = await db.oneOrNone(
            'SELECT id, sacco_name name FROM "Sacco" WHERE sacco_name = $1 OR id = $1 LIMIT 1',
            [sacco]
        );

        if (!saccoData) {
            return res.status(400).json({
                error: 'Invalid sacco',
                message: 'Selected sacco is not valid'
            });
        }

        req.saccoId = saccoData.id;
        req.saccoName = saccoData.name;

    } catch (error) {
        console.error('Error validating sacco:', error);
        return res.status(500).json({
            error: 'Database error',
            message: 'Failed to validate sacco'
        });
    }

    next();
};

module.exports = issueReportMiddleware;