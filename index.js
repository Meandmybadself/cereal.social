// 'use strict'

// pm2's handling env
// require('dotenv').config()

const Twit = require('twit')
const data = require('./data.js')
const mongoose = require('mongoose')
const io = require('socket.io')
const moment = require('moment')
const swearies = require('./swearies.js')
const _ = require('lodash')

let terms = []
data.cereals.forEach(el => {
  terms.push(el)
})

const CerealSchema = new mongoose.Schema({
  id: { type: String, required: false },
  date: { type: Date, required: true, default: Date.now },
  screenname: { type: String, required: false },
  avatar: { type: String, required: true },
  text: { type: String, required: true },
  cereal: { type: String, required: true },
})

const Cereal = mongoose.model('Cereal', CerealSchema)

let t
let stream

mongoose.Promise = global.Promise
mongoose.connect(
  process.env.MONGO_URI,
  {
    db: {
      safe: true,
    },
  }
)

let socketServer = io(2052)
socketServer.on('connection', socket => {
  emitState(socket)
  socket.on('details', obj => {
    //  console.log('details',obj)
    var cerealId = obj.cereal
    var index = obj.index - 1
    Cereal.find({ cereal: cerealId }, null, { skip: index, limit: 1 })
      .then(rsp => {
        rsp = rsp[0]
        delete rsp['_id']
        delete rsp['__v']
        socket.emit('details', rsp)
      })
      .catch(e => {
        console.log('Error when querying details.', e)
      })
  })
})

setTimeout(function() {
  emitState()
}, 20000)

function emitState(socket) {
  const PAST_HOURS = 3
  const OLDEST_POST = moment()
    .subtract(PAST_HOURS, 'hours')
    .toDate()

  Cereal.aggregate(
    {
      $match: {
        date: { $gt: OLDEST_POST },
      },
    },
    { $unwind: '$cereal' },
    {
      $group: {
        _id: '$cereal',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } }
  ).exec((err, rsp) => {
    if (!err) {
      // run through & total the results.
      let total = 0
      for (let i in rsp) {
        total += rsp[i].count
      }
      if (socket) {
        socket.emit('state', { rsp: rsp, total: total })
      } else {
        socketServer.emit('state', { rsp: rsp, total: total })
      }
    } else {
      console.log('Error in query.', err)
    }
  })
}

function getCerealForText(txt) {
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

function hasSwearies(txt) {
  let t = txt.toLowerCase().split(' ')
  let ll = t.length
  while (ll--) {
    if (swearies[t[ll]]) {
      return true
    }
  }
}

function initTwitter() {
  console.log('Initializing Twitter stream')
  t = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_SECRET,
  })

  let trackTerms = []
  terms.forEach(el => {
    trackTerms.push(el.label)
  })

  stream = t.stream('statuses/filter', { track: trackTerms.join(',') })
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
    .on('warning', msg => {
      console.log('Warning message received.', msg)
    })
    .on('tweet', e => {
      if (hasSwearies(e.text)) {
        // console.log("Stopping due to swearies", e.text);
        return
      }
      let cerealId = getCerealForText(e.text)

      // We're talking about KIX airport in Kyoto.
      const ignoreLangCodes = ['jp', 'ja', 'ko', 'id', 'vi', 'ar', 'es', 'th', 'pt', 'zh-tw']
      if (
        cerealId === 'kix' &&
        (ignoreLangCodes.includes(e.lang) ||
          ignoreLangCodes.includes(_.get(e, 'user.lang', '')) ||
          ignoreLangCodes.includes(_.get(e, 'retweeted_status.lang', '')))
      ) {
        return
      } else if (cerealId === 'kix') {
        console.log(_.get(e, 'lang', ''), _.get(e, 'user.lang', ''), _.get(e, 'retweeted_status.lang', ''))
      }

      if (cerealId) {
        let obj = {
          id: e.id_str,
          screenname: e.user.screen_name,
          avatar: e.user.profile_image_url,
          text: e.text,
          cereal: cerealId,
        }

        Cereal.create(obj)
          .then(o => {
            //console.log('Order persisted in DB.',o)
            emitUpdate(o)
          })
          .catch(e => {
            console.log('Error in persisting record to DB.', e)
          })
      } else {
        // console.log("Couldn't find cereal in string.")
      }
    })
}

function emitUpdate(tweet) {
  delete tweet['__v']
  delete tweet['_id']
  socketServer.emit('update', tweet)
}

initTwitter()
