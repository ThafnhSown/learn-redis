const express = require('express');
const route = express.Router()
const acl = require('../helper/acl_service')
const book = require("../models/book.model")
const { verifyAccessToken } = require('../helper/jwt_service')
const { deleteBook, updateBook } = require('../models/repositories/book.repo')
const { findOneUser } = require('../models/repositories/user.repo')

route.post('/add' ,async (req, res) => {
    const { title, year, author } = req.body
    const newBook = new book({
        title,year,author
    })
    await newBook.save()
    return res.json({
        message: 'you are admin',
        newBook
    })
})

route.post('/delete', verifyAccessToken, async (req, res) => {
    const bookId = req.body
    const roles = req.payload.roles
    if(roles.includes('admin')) {
        await deleteBook(bookId)
        return res.json({
            status: 200,
            message: "delete successfully"
        })
    }
    return res.send('you have no access control')
})

route.post('/update', verifyAccessToken, async (req, res) => {
    const {bookId, title, year, author} = req.body
    const roles = req.payload.roles
    const userId = req.payload.userId
    const foundUser = await findOneUser({userId, unSelect: ["__v"]})
    const authorName = foundUser.username
    const check = (authorName === author)
  
    if(roles.includes('author') && check) {
        await updateBook({bookId, title, year, author})
        return res.send("update successfully")
    }
    return res.send('you have no access control')
})

route.post('/sell', verifyAccessToken, async (req, res) => {
    const { bookId, title, year, author } = req.body
    const roles = req.payload.roles
    const userId = req.payload.userId
    const foundUser = await findOneUser({userId, unSelect: ["__v"]})
    if(roles.includes('distributor')) {
        if(foundUser.books.includes(bookId)) {
            res.json({
                title: title,
                year: year,
                author: author,
                publish: 'yes'
            })
        } else {
            res.status(404).json({
                message: "You not have this book"
            })
        }
    } else {
        res.status(404).json({
            message: "You are not distributor"
        })
    }
})

module.exports = route