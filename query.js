'use strict'

const mongoose = require('mongoose')
const moment = require('moment')

const CerealSchema = new mongoose.Schema({
  id: {type: String, required: false},
  date: {type: Date, required: true, default: Date.now},
  screenname: {type: String, required: false},
  avatar: { type: String, required: true},
  text: {type: String, required: true},
  cereal: {type: String, required: true}
})

const Cereal = mongoose.model('Cereal', CerealSchema)

mongoose.Promise = global.Promise
mongoose.connect('mongodb://127.0.0.1/cereals', {
  db: {
    safe: true
  }
})

const PAST_HOURS = 24
const OLDEST_POST = moment().subtract(PAST_HOURS, 'hours').toDate()

Cereal.aggregate(
  {$match: {
      date: {$gt: OLDEST_POST}
  }}
)
  .exec((err, rsp) => {
    console.log(err, rsp)
  })
