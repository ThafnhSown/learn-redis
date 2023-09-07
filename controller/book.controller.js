'use strict';

const BookService = require("../service/book.service");
const { Created, SuccessResponse } = require("../core/success.response")

class BookController {
    static addBook = async(req,res, next) => {
      return new Created({
        message: "Adding a new Book",
        metadata: await BookService.addBook({
          ...req.body,
        })
      }).send(res);
    }
    static findOneBook = async(req, res) => {
      new SuccessResponse({
        message: "oke",
        metadata: await BookService.findOneBook({
          bookId: req.params.bookId,
        })
      }).send(res)
    }
    static getAllBook = async(req,res) => {
      new SuccessResponse({
        message: "find all oke",
        metadata: await BookService.getAllBook(req.query),
      }).send(res);
    }
}

module.exports = BookController;