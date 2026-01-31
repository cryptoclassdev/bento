const express = require('express');
const router = express.Router();
const tokenController = require('./token.controller');

router.get('/:tokenId', tokenController.getTokenPrice);

module.exports = router;
