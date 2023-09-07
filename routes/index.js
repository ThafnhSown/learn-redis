"use strict";

const express = require("express");
const router = express.Router();

router.use("/v1/api", require("./access"));
router.use("/v1/api/book", require("./book"))
router.use("/v1/api/order", require("./order"));
// router.use("/v1/api/user", require("./user"))

module.exports = router;
