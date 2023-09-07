const express = require('express');
const route = express.Router()
const cart = require('../models/cart.model');
const { convertToObjectIdMongodb } = require('../utils');

const createUserCart = async ({ userId, book }) => {
    const query = {
        userId: convertToObjectIdMongodb(userId),
        "listBooks.shopId": convertToObjectIdMongodb(book.shopId)
    },
    updateOrInsert = {
        books: {
            shopId: book.shopId,
            book: [
                {
                    bookId: book.bookId, 
                    quantity: book.quantity
                }
            ]
        }
    },
    options = {
        upsert: true,
        new: true
    }
    return await cart.findOneAndUpdate(query, updateOrInsert, options).exec()
}

route.post("/add", async (req, res) => {
    const { userId, book } = req.body
    const userCart = await cart.findOne({ userId: convertToObjectIdMongodb(userId)}).exec()
    if(!userCart) {
        return await createUserCart({ userId, book })
    }
})

module.exports = route