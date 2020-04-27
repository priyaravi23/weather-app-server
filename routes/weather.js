const express = require('express');
const axios = require('axios');
const qs = require('qs');
var router = express.Router();

const GOOGLE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_URL = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;

console.log('Google API Key: ', process.env.GOOGLE_API_KEY);
console.log('Dark Sky API Key ', process.env.DARK_SKY_API_KEY);
console.log('IP Geolocation API Key', process.env.IP_GEOLOCATOPN_API_KEY);

const DARK_SKY_URL = 'https://api.darksky.net/forecast';
const IP_GEOLOCATOPN_URL = 'https://api.ipgeolocation.io';

/* GET users listing. */
router.get('/places', async function(req, res) {
    const {address} = req.query;
    if (address) {
        const query = {
            types: 'address',
            language: 'en',
            key: process.env.GOOGLE_API_KEY,
            input: address
        };
        try {
            console.log('sending query to ... ', `${GOOGLE_PLACES_URL}?${qs.stringify(query)}`);
            const axiosResponse = await axios(`${GOOGLE_PLACES_URL}?${qs.stringify(query)}`);
            const finalAdress = axiosResponse.data.predictions[0].description;
            if (finalAdress) {
                const axiosGeoResponse = await axios(`${GOOGLE_URL}?${qs.stringify({
                    key: process.env.GOOGLE_API_KEY,
                    address: finalAdress
                })}`);
                res.json(axiosGeoResponse.data);
            } else {
                throw new Error('Could not find an address.');
            }
        } catch (ex) {
            // console.log(ex);
            res.status(500).send({
                message: 'Could not get info'
            });
        }
    } else {
        res.status(400).send({
            message: 'Invalid address data.'
        });
    }
});

router.get('/reverse-geo', async function(req, res, next) {
    const {address} = req.query;
    if (address) {
        const query = {
            key: process.env.GOOGLE_API_KEY,
            address
        };
        try {
            console.log('sending query to ... ', `${GOOGLE_URL}?${qs.stringify(query)}`);
            const axiosResponse = await axios(`${GOOGLE_URL}?${qs.stringify(query)}`);
            res.json(axiosResponse.data);
        } catch (ex) {
            // console.log(ex);
            res.status(500).send({
                message: 'Could not get info'
            });
        }
    } else {
        res.status(400).send({
            message: 'Invalid address data.'
        });
    }
});

router.get('/dark-sky', async function(req, res) {
    const {lat, lng} = req.query;
    try {
        const axiosDarkSkyResponse = await axios(`${DARK_SKY_URL}/${process.env.DARK_SKY_API_KEY}/${lat},${lng}`);
        res.json({
            ...axiosDarkSkyResponse.data
        });
    } catch (ex){
        res.status(500).send({
            message: 'Could not process request.'
        });
    }
});

router.get('/current-geo', async function(req, res) {
    const {ip} = req.query;

    try {
        const axiosResponse = await axios(`${IP_GEOLOCATOPN_URL}/ipgeo?apiKey=${process.env.IP_GEOLOCATOPN_API_KEY}&ip=${ip}`);
        res.json({
            ...axiosResponse.data
        });
    } catch (ex){
        res.status(500).send({
            message: 'Could not process request.'
        });
    }
});

module.exports = router;