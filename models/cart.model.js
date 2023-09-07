'use strict';

const { Schema, model, Types } = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'cart';

// Declare the Schema of the Mongo model
const cartSchema = new Schema(
  {
    listBooks: [
        {   
            shopId: {
                type: Types.ObjectId,
                ref: "Distributor"
            },
            book: [
                {
                    bookId: {
                        type: Types.ObjectId,
                        ref: 'Book'
                    },
                    quantity: {
                        type: Number, 
                        required: true,
                        min: 1
                    }
                }
            ]
        }
    ],
    userId: {
        type: Types.ObjectId,
        required: true
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, cartSchema);
