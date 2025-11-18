// import jwt from 'jsonwebtoken';
// import { ENV_VARS } from './envVar.js';
const jwt = require('jsonwebtoken');
const { ENV_VARS } = require('./envVar.js');

const genTokenAndSendCookie = (userId, res) => {
    const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, { expiresIn: '12d' } );
    
        
    return token;
};

module.exports = { genTokenAndSendCookie };