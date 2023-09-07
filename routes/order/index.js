"use strict";
const express = require("express");
const orderController = require("../../controller/order.controller");
const router = express.Router();
const asyncHandler = require("../../helper/asyncHandler");
const acl = require("../../helper/acl_service")

router.post("/add", acl.middleware(), asyncHandler(orderController.addNewUserOrder));
router.put("/confirm", acl.middleware(), asyncHandler(orderController.confirmOrders));
router.put("/cancel", acl.middleware(), asyncHandler(orderController.cancelOrder));
router.get("/me", acl.middleware(), asyncHandler(orderController.getUserOrders));
router.get("/all", asyncHandler(orderController.getAllOrders));
module.exports = router;
