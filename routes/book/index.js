"use strict";

const express = require("express");
const BookController = require("../../controller/book.controller");
const asyncHandler = require("../../helper/asyncHandler");
const router = express.Router();
const acl = require("../../helper/acl_service")

router.post("/add", acl.middleware(), asyncHandler(BookController.addBook));
router.get("/all", acl.middleware(), asyncHandler(BookController.getAllBook));
router.get("/:bookId", acl.middleware(), asyncHandler(BookController.findOneBook))

module.exports = router;
  