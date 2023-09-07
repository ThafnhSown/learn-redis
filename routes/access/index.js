"use strict";

const express = require("express");
const AccessController = require("../../controller/access.controller");
const asyncHandler = require("../../helper/asyncHandler");
const {verifyAccessToken, verifyRefreshToken} = require("../../helper/jwt_service");

const router = express.Router();

router.post("/signup", AccessController.signUp);
router.post("/login", asyncHandler(AccessController.logIn));

router.post("/logout", [
  asyncHandler(verifyRefreshToken),
  asyncHandler(AccessController.handleLogout),
]);
router.get(
  "/refresh-token",
  asyncHandler(AccessController.handleRefreshToken)
);

module.exports = router;
