const bookModel = require("../models/book.model")
const createError = require("http-errors")
const {findOneBook, findAllBook, findAllBooksForUser } = require("../models/repositories/book.repo")

class BookService {
    static async addBook(body)  {
        const { title, year, author } = body
        const newBook = await bookModel.create({
            title, year, author
        })
        
        return newBook
    }

    static async findOneBook({ bookId}) {
        const foundBook = await findOneBook({ bookId, unSelect: ["__v"]})
        if(!foundBook) return createError.NotFound("Cannot find this book")
        return foundBook
    } 

    static async getAllBook({
        limit = 0,
        page = 1,
        sort = 'ctime'
    }) {
        return await findAllBook({
            limit, sort, page, select: ['title', 'author', 'year']
        })
    }
    
}

module.exports = BookService