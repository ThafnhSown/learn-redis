"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("../service/access.service");
const { check, validationResult } = require("express-validator");
const { BadRequestError } = require("../core/error.response");
const asyncHandler = require("../helper/asyncHandler");

class AccessController {
  static signUp = [
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new BadRequestError(res.json({ errors: errors.array() }));
      }
      new Created({
        message: "Registered successfully!",
        metadata: await AccessService.signUp(req, res),
      }).send(res);
    }),
  ];

  static logIn = async (req, res, next) => {
    new SuccessResponse({
      message: "Login successfully!",
      metadata: await AccessService.logIn(req, res),
    }).send(res);
  };

  static handleRefreshToken = async (req, res) => {
    console.log(req.body);
    new SuccessResponse({
      message: "Refresh token successfully!",
      metadata: await AccessService.refreshToken(req, res),
    }).send(res);
  };

  static handleLogout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout successfully",
      metadata: await AccessService.logout(req, res),
    }).send(res);
  };
}

module.exports = AccessController;
