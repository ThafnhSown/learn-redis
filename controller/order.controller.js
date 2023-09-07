"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const OrderService = require("../service/order.service");

class OrderController {
  static addNewUserOrder = async (req, res, next) => {
    return new Created({
      message: "Create orders successfully!",
      metadata: await OrderService.addNewUserOrder({
        userId: req.body.userId,
        bookId: req.body.bookId,
        quantity: req.body.quantity
      }),
    }).send(res);
  };

  static confirmOrders = async (req, res, next) => {
    return new SuccessResponse({
      message: "Confirm order successfully!",
      metadata: await OrderService.confirmOrders({
        orderId: req.body.orderId,
      }),
    }).send(res);
  };

  static cancelOrder = async (req, res, next) => {
    return new SuccessResponse({
      message: "Cancel order successfully!",
      metadata: await OrderService.cancelOrder({
        orderId: req.body.orderId,
        reason: req.body.reason
      }),
    }).send(res);
  };

  static getUserOrders = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get orders successfully!",
      metadata: await OrderService.getUserOrders({
        userId: req.body.userId,
      }),
    }).send(res);
  };
  static getAllOrders = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get orders successfully!",
      metadata: await OrderService.getAllOrders(req.query),
    }).send(res);
  };
}

module.exports = OrderController;
