'use strict'

const books = require("../book.model")
const { isEmpty } = require("lodash");
const {
    getSelectData, getUnselectData, convertToObjectIdMongodb,
  } = require("../../utils/index");


const findOneBook = async({ bookId, unSelect }) => {
    return await books.findById(bookId).select(getUnselectData(unSelect)).exec()
}
const findAllBook = async ({
    limit=18, 
    page=1,
    sort="ctime",
    filter={},
}) => {
    const skip = limit*(page-1);
    const sortBy = sort === "ctime"?{year:-1} : {year:1};
    const documents = await books.find(filter).sort(sortBy).limit(limit).skip(skip).lean().exec();
    return documents
}
const findAllBooksForUser = async ({
    limit, title, page, sort, select
}) => {
    const skip = limit*(page - 1)
    const sortBy = sort === "ctime" ? { _id : -1} : { _id: 1 }
    let bookFilter = {}
    if(!isEmpty(title)) {
        const regexSearch = new RegExp(title)
        bookFilter.title = { $regex: regexSearch, $options: "i" }
    }
    const [book, count] = await Promise.all([
        books.aggregate([
            { $match: bookFilter },
            { $sort: sortBy },
            { $skip: skip },
            { $limit: limit },    
            { $project: getSelectData(select) },
        ]).exec(),books.countDocuments(bookFilter),
    ]);

    return { book, count };
}

const deleteBook = async ({ bookId }) => {
    const query = { 
        _id: convertToObjectIdMongodb(bookId)
    }
    return await books.deleteOne(query)
}

const updateBook = async ({bookId, title, year, author}) => {
    const query = {
        _id: convertToObjectIdMongodb(bookId)
    }
    return await books.updateOne(query, {
        $set: {
            title: title,
            year: year,
            author: author
        }
    })
}

module.exports = { findOneBook, findAllBook, findAllBooksForUser, deleteBook, updateBook }