const express = require('express');
const route = express.Router()
const book = require("../models/book.model")
const { verifyAccessToken } = require('../helper/jwt_service')
const { deleteBook, updateBook } = require('../models/repositories/book.repo')
const { findOneUser } = require('../models/repositories/user.repo')
route.post('/add',verifyAccessToken, async (req, res) => {
    const { title, year, author } = req.body
    const roles = req.payload.roles
    if(roles.includes('admin') || roles.includes('author')) {
        const newBook = new book({
            title,year,author
        })
        await newBook.save()
        return res.json({
            message: 'you are admin',
            newBook
        })
    }
    return res.send('you have no access control')
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

module.exports = route