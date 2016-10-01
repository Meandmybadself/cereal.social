var scene
var camera
var world
var renderer
var io
var socket
var cereals
var hasInit
var domEvents
var useShadows = false
var boxTotal = 0
var examMode = document.location.hash === '#exam'

var BOX_SCALE = 1
var BOX_WIDTH = 14 * BOX_SCALE
var BOX_HEIGHT = 18 * BOX_SCALE
var BOX_DEPTH = 3 * BOX_SCALE

var GAP = 0.5

var TABLE_HEIGHT = 3

var order = [
  [100, 99, 98, 97, 96, 95, 94, 93, 92, 91],
  [65, 64, 63, 62, 61, 60, 59, 58, 57, 90],
  [66, 37, 36, 35, 34, 33, 32, 31, 56, 89],
  [67, 38, 17, 16, 15, 14, 13, 30, 55, 88],
  [68, 39, 18, 5, 4, 3, 12, 29, 54, 87],
  [69, 40, 19, 6, 1, 2, 11, 28, 53, 86],
  [70, 41, 20, 7, 8, 9, 10, 27, 52, 85],
  [71, 42, 21, 22, 23, 24, 25, 26, 51, 84],
  [72, 43, 44, 45, 46, 47, 48, 49, 50, 83],
  [73, 74, 75, 76, 77, 78, 79, 80, 81, 82]
]

var cerealColors = {
  'corn-chex': {color: 0x2B7E38, label: 'Corn Chex'},
  'multi-grain-cheerios': {color: 0xFF0000, label: 'Multi-Grain Cheerios'},
  'alpha-bits': {color: 0x0F4DA3, label: 'Alpha-Bits'},
  'cinnamon-chex': {color: 0xB51017, label: 'Cinnamon Chex'},
  'mini-wheats': {color: 0xFA974A, label: 'Mini-Wheats'},
  'wheat-chex': {color: 0xFF0000, label: 'Wheat Chex'},
  'grape-nuts': {color: 0xFFFFFF, label: 'Grape Nuts'},
  'rice-chex': {color: 0x0095C8, label: 'Rice Chex'},
  'apple-cinnamon-cheerios': {color: 0x66A52F, label: 'Apple Cinnamon Cheerios'},
  'golden-crisp': {color: 0xCE8826, label: 'Golden Crisp'},
  'all-bran': {color: 0xE36B03, label: 'All-Bran'},
  'smorz': {color: 0x00A9CF, label: 'Smorz'},
  'crispix': {color: 0x044A83, label: 'Crispix'},
  'cinnamon-life': {color: 0x51A9DF, label: 'Cinnamon Life'},
  'chocolate-cheerios': {color: 0x391D18, label: 'Chocolate Cheerios'},
  'waffle-crisp': {color: 0xD7A900, label: 'Waffle Crisp'},
  'boo-berry': {color: 0x0068A5, label: 'Boo Berry'},
  'honey-smacks': {color: 0xD2272A, label: 'Honey Smacks'},
  'corn-pops': {color: 0xFEF100, label: 'Corn Pops'},
  'golden-grahams': {color: 0xFFFC41, label: 'Golden Grahams'},
  'cocoa-pebbles': {color: 0x4B221F, label: 'Cocoa Pebbles'},
  'count-chocula': {color: 0x3D1F16, label: 'Count Chocula'},
  'reeses-puffs': {color: 0xFB781D, label: 'Reeses Puffs'},
  'cookie-crisp': {color: 0xFFFFFF, label: 'Cookie Crisp'},
  'capn-crunch': {color: 0xFF382A, label: 'Capn Crunch'},
  'honey-nut-cheerios': {color: 0xFCC930, label: 'Honey Nut Cheerios'},
  'krave': {color: 0xFFFFFF, label: 'Krave'},
  'raisin-bran': {color: 0xAF1F91, label: 'Raisin Bran'},
  'wheaties': {color: 0xE33600, label: 'Wheaties'},
  'apple-jacks': {color: 0x00CB31, label: 'Apple Jacks'},
  'froot-loops': {color: 0xF32016, label: 'Froot Loops'},
  'special-k': {color: 0xFFFFFF, label: 'Special K'},
  'rice-krispies': {color: 0x00A0D3, label: 'Rice Krispies'},
  'kix': {color: 0xF4782F, label: 'Kix'},
  'berry-berry-kix': {color: 0x7C1A82, label: 'Berry Berry Kix'},
  'frosted-flakes': {color: 0x0563B3, label: 'Frosted Flakes'},
  'lucky-charms': {color: 0xEF2029, label: 'Lucky Charms'},
  'frosted-cheerios': {color: 0x0070B8, label: 'Frosted Cheerios'},
  'cheerios': {color: 0xFCCC03, label: 'Cheerios'},
  'cinnamon-toast-crunch': {color: 0xFFFFFF, label: 'Cinnamon Toast Crunch'},
  'fruity-pebbles': {color: 0xFF0000, label: 'Fruity Pebbles'},
  'cocoa-puffs': {color: 0x441413, label: 'Cocoa Puffs'}
}

function rad2deg (radians) {
  return radians * (180 / Math.PI)
}
function deg2rad (degrees) {
  return degrees * (Math.PI / 180)
}

function getPosition (index) {
  var orderLen = order.length
  var startX = (order[0].length * BOX_WIDTH) + (GAP * order[0].length - 1) - 10
  var startY = (order.length * BOX_HEIGHT) + (GAP * order.length - 1)

  index++

  for (var row = 0; row < orderLen; row++) {
    for (var col = 0; col < order[row].length; col++) {
      if (order[row][col] === index) {
        var x = -(startX / 2) + (BOX_WIDTH * col) + (GAP * col)
        var y = (BOX_DEPTH * 0.5) + (TABLE_HEIGHT * 0.5)
        var z = -(startY / 2) + (BOX_HEIGHT * row) + (GAP * row)
        // console.log(index,x,y,z)
        return new THREE.Vector3(x, y, z)
      }
    }
  }
}

function getBox (id) {

  var box = new THREE.BoxBufferGeometry(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH, 1, 1, 1)
  var mat = getMat(id)
  var mesh = new THREE.Mesh(box, mat)
  mesh.castShadow = useShadows
  mesh.rotation.x = deg2rad(90)

  return mesh
}

function getMat(id) {

  if(!cerealColors[id].mat) {
    var textureLoader = new THREE.TextureLoader()
    var texPath = '/assets/images/textures/cereals/' + id + '.jpg'
    var color = cerealColors[id].color
    var shininess = 10
    var flatMat = new THREE.MeshPhongMaterial({ color: color, specular: color, shininess: 10, shading: THREE.FlatShading })
    var mat = new THREE.MultiMaterial([
      flatMat,
      flatMat,
      flatMat,
      flatMat,
      flatMat,
      // flatMat,
      new THREE.MeshBasicMaterial({map: textureLoader.load(texPath)}),
      flatMat
    ])

    cerealColors[id].mat = mat;
  }
  return cerealColors[id].mat;
}

$(function () {
  setup3d()
  buildWorld()
  render()
  connectToSocket()
})

function randomBetween (min, max) {
  var delta = max - min
  return Math.floor(Math.random() * delta) + min
}

function getShortestColumn (id) {
  // console.log('gsc',id)
  var fewestColumns = 9999
  var shortestCol
  var cols = cereals[id].columns
  var colsLen = cols.length
  // console.log(cols,colsLen)

  while(colsLen--) {
    var kids = cols[colsLen].children
    var kidsLen = kids.length
    if (kidsLen < fewestColumns) {
      shortestCol = cols[colsLen]
      fewestColumns = kidsLen
    }
  }
  return shortestCol
}

function getTallestColumn (id) {
  var mostCol = 0
  var shortestCol
  var cols = cereals[id].columns
  var colsLen = cols.length

  while(colsLen--) {
    var kids = cols[colsLen].children
    var kidsLen = kids.length
    if (kidsLen > mostCol) {
      shortestCol = cols[colsLen]
      mostCol = kidsLen
    }
  }
  return mostCol
}



function addBoxes (id, count) {
  var mesh = getBox(id)

  for (var i = 0; i < count; i++) {
    var m = mesh.clone()
    var col = getShortestColumn(id)
    var kidsLen = col.children.length
    m.position.y = kidsLen * BOX_DEPTH
    m.rotation.z = deg2rad(randomBetween(-3, 3))

    col.add(m)
    TweenMax.from(m.position, 0.5, {y: 200,ease: Quad.easeOut})
    TweenMax.from(m.rotation, 0.5, {x: deg2rad(5),ease: Quad.easeOut})

    domEvents.addEventListener(m,'mouseover',$.proxy(onBoxMouseover, this));
    domEvents.addEventListener(m,'mouseout',$.proxy(onBoxMouseout, this));

  }
}

function onBoxMouseover (e) {
  console.log('onBoxMouseover', e)
}
function onBoxMouseout (e) {

}

function removeBoxes (id, count) {
  console.log('removeBoxes',id,count)
  var col = getTallestColumn(id)
  TweenMax.to(col, 0.3, {y:(-BOX_DEPTH * BOX_SCALE) * count})//, onComplete:onBoxesRemoved, onCompleteParams:[id,count]})
}

// function onBoxesRemoved(id,count) {
//   //Remove the bottom 'count' boxes, then snap all the other boxes up by
// }

function updateTable (id, count) {
  var li = $('li[data-id="' + id + '"]')
  li.find('span.value').text(count)
  li.find('span.per').text(Math.floor((count / boxTotal) * 100) + '%')
}

function createTweet (t) {
  var d = moment(new Date(t.date)).format('h:mm:ss')
  console.log(d)
  var li = $("<li class='tweet'><dl><dt><table cellspacing='0'><tr><td><a href='https://twitter.com/" + t.screenname + "' target='_blank'>" + t.screenname + "</a></td><td>" + d + "</td></tr></table></dt><dd><div><a href='https://twitter.com/statuses/" + t.id + "' target='_blank'>" + t.text + '</a></div><div><img class="cereal" src="/assets/images/textures/cereals/' + t.cereal + '.jpg" alt="' + t.cereal + '"/></div></dd></dl></li>')
  $('#tweets').append(li)
  if ($('#tweets').children().length > 4) {
    $('#tweets .tweet:last-child').remove();
  }
}

function connectToSocket () {
  if (document.location.hostname.indexOf('local') > -1) {
    socket = io.connect(document.location.hostname + ':2052')
  } else {
    socket = io.connect()
  }

  socket.on('connect', function () {
    //console.log('connected')
  })

  socket.on('update', function (tweet) {
    //console.log('update', tweet)
    // What cereal are we attributing this to?
    var cId = tweet.cereal
    var cObj = cereals[cId]
    cObj.count++

    createTweet(tweet)

    addBoxes(cId, 1)
    updateTable(cId, cObj.count)
  })

  socket.on('state', function (data) {
    console.log('state', data)

    var ll
    boxTotal = data.total

    if (!hasInit) {
      // Build the columns.
      var index = 0

      cereals = {}
      ll = data.rsp.length

      for (var d = 0; d < ll; d++) {
        var c = data.rsp[d]
        var ct = c.count
        var colCt = 1
        var cols = []

        if (ct >= 700) {
          colCt = 18
        } else if (ct >= 600) {
          colCt = 17
        } else if (ct >= 500) {
          colCt = 16
        } else if (ct >= 400) {
          colCt = 15
        } else if (ct >= 300) {
          colCt = 7
        } else if (ct >= 200) {
          colCt = 6
        } else if (ct >= 100) {
          colCt = 4
        } else if (ct >= 40) {
          colCt = 3
        } else if (ct >= 25) {
          colCt = 2
        }

        for (var i = 0; i < colCt; i++) {
          var do3d = new THREE.Object3D()
          var p = getPosition(index++)
          do3d.position.x = p.x
          do3d.position.y = p.y
          do3d.position.z = p.z

          if (do3d.position.z > 0) {
            do3d.rotation.y = deg2rad(180)
          }

          cols.push(do3d)
          world.add(do3d)
        }

        cereals[c['_id']] = {columns: cols, count: 0}

        var label = cerealColors[c['_id']].label
        var per = Math.floor((ct / boxTotal) * 100)
        var li = $('<li data-id="' + c['_id'] + '"><span class="title">' + label + '</span><span class="value">' + ct + '</span><span class="per">' + per + '%</span></li>')
        $('#leaderboard ul').append(li)
      }
      hasInit = true
      setTimeout(function () {
        $('canvas, #gui').addClass('active')
      }, 500)
    }

    ll = data.rsp.length

    while(ll--) {
      var id = data.rsp[ll]['_id']

      var diff = data.rsp[ll].count - cereals[id].count
      cereals[id].count = data.rsp[ll].count

      updateTable(id, data.rsp[ll].count)

      if (diff > 0) {
        $('li[data-id="' + id + '"]').removeClass('up down').addClass('up')
        addBoxes(id, diff)
      } else if (diff < 0) {
        $('li[data-id="' + id + '"]').removeClass('up down').addClass('down')
        removeBoxes(id, diff)
      }
    }
  })
}

function setup3d () {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1200)
  camera.position.z = 150
  camera.position.y = 260
  camera.rotation.x = deg2rad(-55)
  world = new THREE.Object3D()

  scene.add(world)

  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.shadowMapEnabled = useShadows
  renderer.setClearColor(0x111111)
  renderer.setSize(window.innerWidth, window.innerHeight)

  if (examMode) {
    var orbit = new THREE.OrbitControls(camera, renderer.domElement)
    orbit.enableZoom = true
    //$('#gui').css('display','none')
  }

  domEvents = new THREEx.DomEvents(camera, renderer.domElement)

  document.body.appendChild(renderer.domElement)
  $(window).resize(onResize)

  onResize()
}

function render () {
  window.requestAnimationFrame(render)

  frameUpdate()
  renderer.render(scene, camera)
}

function onResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function frameUpdate () {
  var r = rad2deg(world.rotation.y) + 0.4
  if (!examMode) {
    world.rotation.y = deg2rad(r)
  }
}

function buildWorld () {
  setupLights()
  loadWorld()
}

function addPointLight (color, intensity, range, x, y, z, showLight) {
  if (showLight && examMode) {
    // var geometry = new THREE.SphereBufferGeometry(5, 32, 32)
    // var material = new THREE.MeshBasicMaterial({color: color})
    // var sphere = new THREE.Mesh(geometry, material)
    // sphere.position.set(x, y, z)
    // world.add(sphere)
  }

  var l = new THREE.PointLight(color, intensity, range)
  l.position.set(x, y, z)
  l.castShadow = useShadows
  world.add(l)
}

function addSpotLight (color, intensity, range, x, y, z, showLight) {
  if (showLight && examMode) {
    var geometry = new THREE.ConeGeometry(5, 20, 32)
    var material = new THREE.MeshBasicMaterial({color: color})
    var cone = new THREE.Mesh(geometry, material)
    cone.position.set(x, y, z)
    world.add(cone)
  }

  var spotLight = new THREE.SpotLight(color, 0.5, 0, Math.PI / 10)
  spotLight.position.set(x, y, z)

  world.add(spotLight)

  var l = new THREE.PointLight(color, intensity, range)
  l.position.set(x, y, z)
  l.castShadow = useShadows
  world.add(l)
}

function setupLights () {
  addPointLight(0xFFCCCC, 1, 900, -250, 50, -95, false)
  addPointLight(0xFFCCCC, 0.75, 600, 60, 45, 90, true)
  addSpotLight(0xFFDDDD, 2, 300, 0, 150, 0, false)
}

function setGroupMaterial (dae, arr, col, isShiny) {
  var ll = arr.length
  var mat
  if (isShiny) {
    mat = new THREE.MeshLambertMaterial({color: col})
  } else {
    mat = new THREE.MeshPhongMaterial({color: col})
  }
  while(ll--) {
    var obj = dae.getObjectByName(arr[ll])
    if (obj) {
      obj.children[0].material = mat
    } else {
      console.log('couldnt find object named ' + arr[ll])
    }
  }
}

function loadWorld () {
  var loader = new THREE.ColladaLoader()
  loader.load('/assets/geometry/scene.dae', function (c) {
    var dae = c.scene
    dae.scale.x =
      dae.scale.y =
        dae.scale.z = 0.4
    dae.castShadows = useShadows

    var wallMat = new THREE.MeshLambertMaterial({color: 0x101114})

    for (var i = 1; i < 8; i++) {
      dae.getObjectByName('Wall-' + i).children[0].material = wallMat
    }

    var doors = ['Door.1',
      'Door.2',
      'Lower-cabinetdoor-3-door',
      'Lower-cabinetdoor-2-door',
      'Lower-cabinetdoor-1-door',
      'Lower-cabinetdoor-3',
      'Lower-cabinetdoor-2',
      'Lower-cabinetdoor-1',
      'Upper-cabinet-1-door',
      'Upper-cabinet-0-door',
      'Drawer-3-drawer',
      'Drawer-2-drawer',
      'Drawer-1-drawer',
      'Drawer-4-drawer',
      'Drawer-5-drawer',
      'Drawer-6-drawer',
      'Drawer-7-drawer',
      'Drawer-8-drawer',
      'Drawer-9-drawer',
      'Lower-cabinetdoor-2-door',
      'Lower-cabinetdoor-1-door',
      'Lower-cabinetdoor-3-door',
      'Upper-Cabinet-2-Door',
      'Upper-Cabinet-3-Door',
      'Shelf'

    ]

    setGroupMaterial(dae, doors, 0x232529, true)

    var fridgeParts = [
      'Top_Door',
      'Bottom_Door',
      'Fridge_Base'
    ]
    setGroupMaterial(dae, fridgeParts, 0x212627, true)

    var fridgeHandles = [
      'Top_Handle',
      'Bottom__Handle'

    ]

    setGroupMaterial(dae, fridgeHandles, 0x333333)

    var counterTops = [
      'Countertop-0-top',
      'Lower-Cabinet-1-Countertop'
    ]

    setGroupMaterial(dae, counterTops, 0x26282c)

    var counterBases = [
      'Lower-Cabinet-1',
      'Lower-Cabinet-base-2',
      'Upper-cabinet-1-base',
      'Upper-cabinet-0-base',
      'Upper-Cabinet-3-Base',
      'Upper-Cabinet-2-Base',
      'Lower-Cabinet-1-Base',
      'In-between-cabinet-shelf-1',
      'In-between-cabinet-shelf-2',
      'In-between-cabinet-shelf-3',
      'In-between-cabinet-shelf-4'
    ]
    setGroupMaterial(dae, counterBases, 0x17191c)

    var knobs = [
      'Drawer-3-knob',
      'Drawer-2-knob',
      'Drawer-1-knob',
      'Lower-cabinetdoor-3-knob',
      'Lower-cabinetdoor-2-knob',
      'Lower-cabinetdoor-1-knob',
      'Upper-cabinet-1-knob',
      'Upper-cabinet-0-knob',
      'Drawer-4-knob',
      'Drawer-5-knob',
      'Drawer-6-knob',
      'Drawer-7-knob',
      'Drawer-8-knob',
      'Drawer-9-knob',
      'Upper-Cabinet-2-Knob',
      'Upper-Cabinet-3-Knob'
    ]
    setGroupMaterial(dae, knobs, 0x18191b)

    dae.getObjectByName('Tabletop').children[0].material = new THREE.MeshLambertMaterial({color: 0x4e3c37})
    dae.getObjectByName('Floor').children[0].material = new THREE.MeshLambertMaterial({color: 0x22222A})
    dae.getObjectByName('Sink').children[0].material = new THREE.MeshLambertMaterial({color: 0x333333})
    dae.getObjectByName('Recycling').children[0].material = new THREE.MeshLambertMaterial({color: 0x28282f})
    dae.getObjectByName('Garbage').children[0].material = new THREE.MeshLambertMaterial({color: 0x26282c})

    world.add(dae)
  })
}
