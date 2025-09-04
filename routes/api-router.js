const express = require('express');
const router = express.Router();

const searchDestination = require('../modules/destination');
const createIssue = require('../modules/issue');
const routeDetails = require('../modules/route');
const issueReportMiddleware = require('../middlewares/issue-report-middleware');
const saccoDetails = require("../modules/sacco");

router.get('/destination', async function(req, res, next) {
    try {
        const destination = req.query.search;
        const destinations = await searchDestination(destination);
        res.json({ destinations });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/routes', async function(req, res, next) {
    try {
        const { saccoId, route } = req.body;
        const result = await routeDetails({ saccoId, route });
        res.json({ routeDetails: result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/report-issue', issueReportMiddleware, async (req, res) => {
    try {
        const data = req.body;
        data.saccoId = req.saccoId;

        const result = await createIssue(data);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error saving issue report:', error);
        res.status(500).json({ error });
    }
});

router.get('/saccos', async (req, res) => {
    try {
        res.json({ saccos: await saccoDetails() });
    } catch (error) {
        console.error('Error saving issue report:', error);
        res.status(500).json({ error });
    }
});

module.exports = router;