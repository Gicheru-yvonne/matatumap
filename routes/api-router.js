const express = require('express');
const router = express.Router();

const searchDestination = require('../modules/destination');
const routeDetails = require('../modules/route');

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

module.exports = router;