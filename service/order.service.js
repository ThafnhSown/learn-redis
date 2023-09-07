"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const { findOneBook, updateStock } = require("../models/repositories/book.repo")
const orderModel = require("../models/order.model");
const { convertToObjectIdMongodb } = require("../utils");

class OrderService {
  static async addNewUserOrder({ userId, bookId, quantity }) {    
    const foundBook = await findOneBook({ bookId, unSelect: ["__v"]})
      let productList = [];
      let totalPrice = 0;   
          if (foundBook.stock >= quantity) {
            productList.push({
              bookId: bookId,
              quantity: quantity,
            });
            totalPrice += 1;
          } else
            throw new BadRequestError(
              `${foundBook.title} đã hết hàng, vui lòng chọn lại`
            );
        //create order list
        const result = await Promise.all([
          await updateStock({
            id: bookId,
            quantity: quantity
          }), 
          await orderModel.create({
            userId: userId,
            book: productList[0],
            status: "PENDING",
          })
        ])
    return result;
  }

  static async confirmOrders({orderId}) {
    const foundOrder = await orderModel.findOneAndUpdate(
      {_id: orderId},
      {
        status: "CONFIRMED",
        confirmAt: new Date()
      }
      ).exec()
      return foundOrder
  }
  
  static async cancelOrder({orderId, reason}) {
    const foundOrder = await orderModel.findOne(
      {_id: orderId}
      ).exec()
    
    if(!foundOrder) {
      throw new NotFoundError("Order not found")
    }
    if(foundOrder.status !== "PENDING") {
      throw new BadRequestError("Cannot cancel order")
    }
    return await orderModel.findOneAndUpdate(
      {_id: orderId},
      {
        status: "CANCEL",
        cancel: {
          reason: reason,
          cancelAt: new Date()
        }
      }
    )
  }

  static async getUserOrders({ userId }) {
    const status = "PENDING" || "CONFIRMED"
    return await orderModel.findOne(
      {
        userId: convertToObjectIdMongodb(userId),
        status: status
      }
    )
  }

  static async getAllOrders() {
    const status = "PENDING" || "CONFIRMED"
    const filter = { status: status } 
    return await orderModel.find(filter).limit(10).lean().exec()
  }
}

module.exports = OrderService;
