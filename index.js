'use strict'

require('dotenv').config()

const Twit = require('twit')
const data = require('./data.js')
const mongoose = require('mongoose')

let terms = []
data.cereals.forEach((el) => {
  terms.push(el)
})

const CerealSchema = new mongoose.Schema({
  id: {type: String, required: false},
  date: {type: Date, required: true, default: Date.now},
  screenname: {type: String, required: false},
  avatar: { type: String, required: true},
  text: {type: String, required: true},
  cereal: {type: String, required: true}
})

const Cereal = mongoose.model('Cereal', CerealSchema)

let t
let stream

mongoose.Promise = global.Promise
mongoose.connect('mongodb://127.0.0.1/cereals', {
  db: {
    safe: true
  }
})

function getCerealForText (txt) {
  txt = txt.toLowerCase()
  let tl = terms.length
  for (let i = 0; i < tl; i++) {
    let el = terms[i]
    let label = el.label.toLowerCase()
    if (txt.indexOf(label) > -1) {
      return el.id
    }
  }
}

function initTwitter () {
  console.log('Initializing Twitter stream')
  t = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_SECRET
  })

  let trackTerms = []
  terms.forEach((el) => {
    trackTerms.push(el.label)
  })

  stream = t.stream('statuses/filter', {'track': trackTerms.join(',')})
  stream
    .on('connect', () => {
      console.log('connected.')
    })
    .on('disconnect', () => {
      console.log('disconnected')
    })
    .on('limit', () => {
      console.log('limit msg')
    })
    .on('warning', (msg) => {
      console.log('Warning message received.', msg)
    })
    .on('tweet', (e) => {
      console.log(e.text)

      let cerealId = getCerealForText(e.text)

      if (cerealId) {
        let obj = {
          id: e.id_str,
          screenname: e.user.screen_name,
          avatar: e.user.profile_image_url,
          text: e.text,
          cereal: cerealId
        }

        Cereal.create(obj)
          .then(() => {
            console.log('Order persisted in DB.')
          }).catch((e) => {
          console.log('Error in persisting record to DB.', e)
        })
      } else {
        console.log("Couldn't find cereal in string.")
      }
    })
}

initTwitter()
