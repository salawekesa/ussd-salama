const functions = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

app.post('/salamaussd', async (req, res) => {
    const {
        sessionId,
        serviceCode,
        phoneNumber,
        text,
    } = req.body;

    let response = '';
    let textArray = text.split('*');
    let userResponse = textArray.length > 0 ? textArray[textArray.length - 1] : '';

    if (text === '') {
        response = `CON Welcome to Sauti Salama
        1. Report an Incident
        2. My phone number`;
    } else if (text === '1') {
        response = `CON Choose the type of incident
        1. Rape
        2. Sexual Assault
        3. Physical Assault
        4. Forced Marriage
        5. Denial of Resources
        6. Psychological Abuse`;
    } else if (text.startsWith('1*')) {
        const incidentType = textArray[1];
        if (textArray.length === 2) {
            response = `CON Enter your full name`;
        } else if (textArray.length === 3) {
            response = `CON Enter your address`;
        } else if (textArray.length === 4) {
            response = `CON Preferred method of communication
            1. Phone
            2. Email`;
        } else if (textArray.length === 5) {
            const communicationMethod = textArray[4];
            if (communicationMethod === '1') {
                response = `CON Enter your phone number`;
            } else if (communicationMethod === '2') {
                response = `CON Enter your email address`;
            }
        } else if (textArray.length === 6) {
            response = `CON Provide a description of the incident`;
        } else if (textArray.length === 7) {
            const fullName = textArray[2];
            const address = textArray[3];
            const communicationMethod = textArray[4] === '1' ? 'Phone' : 'Email';
            const contactInfo = textArray[5];
            const description = textArray[6];

            try {
                // Save incident data to Firestore
                await db.collection('ussd').add({
                    incidentType,
                    fullName,
                    address,
                    communicationMethod,
                    contactInfo,
                    description,
                    phoneNumber,
                    timestamp: new Date().toISOString()
                });
                console.log('Incident reported successfully');
                response = `END Thank you for reporting the incident. Our team will contact you shortly.`;
            } catch (error) {
                console.error('Error reporting incident:', error);
                response = `END An error occurred while reporting the incident. Please try again later.`;
            }
        }
    } else if (text === '2') {
        response = `END Your phone number is ${phoneNumber}`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

exports.salamaussd = onRequest(app);

