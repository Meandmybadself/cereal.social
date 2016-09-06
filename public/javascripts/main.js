var scene
var camera
var world
var renderer
var table
var io
var socket
var cereals
var hasInit

var SCALE = 0.25
var BOX_WIDTH = 14 * SCALE
var BOX_HEIGHT = 18 * SCALE
var BOX_DEPTH = 3 * SCALE

var GAP = 3

var TABLE_HEIGHT = 3

var order = [
  [37, 36, 35, 34, 33, 32, 31],
  [38, 17, 16, 15, 14, 13, 30],
  [39, 18, 5, 4, 3, 12, 29],
  [40, 19, 6, 1, 2, 11, 28],
  [41, 20, 7, 8, 9, 10, 27],
  [42, 21, 22, 23, 24, 25, 26],
  [43, 44, 45, 46, 47, 48, 49]
]

var cerealColors = {
  'corn-chex': {color: 0x2B7E38},
  'multi-grain-cheerios': {color: 0xFF0000},
  'alpha-bits': {color: 0x0F4DA3},
  'cinnamon-chex': {color: 0xB51017},
  'mini-wheats': {color: 0xFA974A},
  'wheat-chex': {color: 0xFF0000},
  'grape-nuts': {color: 0xFFFFFF},
  'rice-chex': {color: 0x0095C8},
  'apple-cinnamon-cheerios': {color: 0x66A52F},
  'golden-crisp': {color: 0xCE8826},
  'all-bran': {color: 0xE36B03},
  'smorz': {color: 0xFF0000},
  'crispix': {color: 0x044A83},
  'cinnamon-life': {color: 0x51A9DF},
  'chocolate-cheerios': {color: 0x391D18},
  'waffle-crisp': {color: 0xD7A900},
  'boo-berry': {color: 0x0068A5},
  'honey-smacks': {color: 0xD2272A},
  'corn-pops': {color: 0xFF0000},
  'golden-grahams': {color: 0xFFFC41},
  'cocoa-pebbles': {color: 0x4B221F},
  'count-chocula': {color: 0x3D1F16},
  'reeses-puffs': {color: 0xFB781D},
  'cookie-crisp': {color: 0xFFFFFF},
  'capn-crunch': {color: 0xFF0000},
  'honey-nut-cheerios': {color: 0xFCC930},
  'krave': {color: 0xFFFFFF},
  'raisin-bran': {color: 0xAF1F91},
  'wheaties': {color: 0xFF0000},
  'apple-jacks': {color: 0xFF0000},
  'froot-loops': {color: 0xFF0000},
  'special-k': {color: 0xFFFFFF},
  'rice-krispies': {color: 0xFF0000},
  'kix': {color: 0xF4782F},
  'berry-berry-kix': {color: 0x7C1A82},
  'frosted-flakes': {color: 0xFF0000},
  'lucky-charms': {color: 0xEF2029},
  'frosted-cheerios': {color: 0x0070B8},
  'cheerios': {color: 0xFCCC03},
  'cinnamon-toast-crunch': {color: 0xFFFFFF},
  'fruity-pebbles': {color: 0xFF0000},
  'cocoa-puffs': {color: 0x441413}
}

function rad2deg(radians) {
  return radians * (180/Math.PI)
}
function deg2rad(degrees) {
  return degrees * (Math.PI/180)
}

function getPosition (index) {
  var orderLen = order.length
  var startX = (order[0].length * BOX_WIDTH) + (GAP * order[0].length - 1)
  var startY = (order.length * BOX_HEIGHT) + (GAP * order.length - 1)

  index++

  for (var row = 0; row < orderLen; row++) {
    for (var col = 0; col < order[row].length; col++) {
      if (order[row][col] === index) {
        var x = -(startX / 2) + (BOX_WIDTH * col) + (GAP * col)
        var y = 0
        var z = -(startY / 2) + (BOX_HEIGHT * row) + (GAP * row)
        //console.log(index,x,y,z)
        return new THREE.Vector3(x, y, z)
      }
    }
  }
  console.log(index)
}



function getBox (id) {
  var textureLoader = new THREE.TextureLoader()
  var texPath = '/assets/images/textures/cereals/' + id + '.jpg'
  var box = new THREE.BoxBufferGeometry(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH)
  var color = cerealColors[id].color

  var mat = new THREE.MultiMaterial([
    new THREE.MeshPhongMaterial( { color: color, specular: color, shininess: 30, shading: THREE.FlatShading } ),
    new THREE.MeshPhongMaterial( { color: color, specular: color, shininess: 30, shading: THREE.FlatShading } ),
    new THREE.MeshPhongMaterial( { color: color, specular: color, shininess: 30, shading: THREE.FlatShading } ),
    new THREE.MeshPhongMaterial( { color: color, specular: color, shininess: 30, shading: THREE.FlatShading } ),
    new THREE.MeshPhongMaterial( { color: color, specular: color, shininess: 30, shading: THREE.FlatShading } ),
    new THREE.MeshBasicMaterial({map: textureLoader.load(texPath)}),
    new THREE.MeshPhongMaterial( { color: color, specular: color, shininess: 30, shading: THREE.FlatShading } )
  ])
  var mesh = new THREE.Mesh(box, mat)
  mesh.rotation.x = deg2rad(90)
  return mesh
}

$(function () {
  setup3d()
  buildWorld()
  render()
  connectToSocket()
})

function randomBetween(min,max) {
  var delta = max - min
  return Math.floor(Math.random() * delta) + min
}

function addBoxes (id, count) {
  // console.log('addBoxes',id,count)
  var container = cereals[id].container
  var kids = container.children
  var kidsLen = kids.length

  var mesh = getBox(id)

  for (var i = 0; i < count; i++) {
    var m = mesh.clone()
    m.position.y = kidsLen * BOX_DEPTH
    m.rotation.z = deg2rad(randomBetween(-5,5))
    container.add(m)
    kidsLen++
  }
}
function removeBoxes (id, count) {
  console.log('removeBoxes', id, count)
}

function connectToSocket () {
  socket = io.connect()
  socket.on('connect', function () {
    console.log('connected')
  })
  socket.on('update', function (data) {
    console.log('update', data)

    var ll

    if (!hasInit) {
      // Init old cereals for the first time if it doesn't exist.
      cereals = {}
      ll = data.length
      while(ll--) {
        var c = data[ll]
        var do3d = new THREE.Object3D()
        var p = getPosition(ll)
        do3d.position.x = p.x
        do3d.position.y = p.y + (BOX_DEPTH * 0.5) + (TABLE_HEIGHT * 0.5)
        do3d.position.z = p.z
        scene.add(do3d)
        cereals[c['_id']] = {container: do3d, count: 0}
      }
      hasInit = true
    }

    ll = data.length
    while(ll--) {
      var id = data[ll]['_id']
    //  console.log(id)
      var diff = data[ll].count - cereals[id].count
      cereals[id].count = data[ll].count
      if (diff > 0) {
        addBoxes(id, diff)
      } else if (diff < 0) {
        removeBoxes(id, diff)
      }
    // console.log(ll,diff)
    }

    // Go through & run diff from old data to new data, creating / killing.

  // if (!oldCereals) {
  //   oldCereals = {}
  //
  //   for(var c in data) {
  //     oldCereals
  //   }
  //
  // } else {
  //   // Go through & find differences for each of their value.
  //
  // }
  })
}

function setup3d () {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 12000)
  camera.position.z = 200
  camera.position.y = 140
  world = new THREE.Object3D()

  scene.add(world)

  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setClearColor(0x779194)
  renderer.setSize(window.innerWidth, window.innerHeight)

  var orbit = new THREE.OrbitControls(camera, renderer.domElement)
  // orbit.enableZoom = false

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
}

function buildWorld () {
  setupLights()
  createTable()
}

function setupLights () {
  var ambientLight = new THREE.AmbientLight(0x000000)
  scene.add(ambientLight)

  var lights = []
  lights[ 0 ] = new THREE.PointLight(0xffffff, 1, 0)
  lights[ 1 ] = new THREE.PointLight(0xffffff, 1, 0)
  lights[ 2 ] = new THREE.PointLight(0xffffff, 1, 0)

  lights[ 0 ].position.set(0, 200, 0)
  lights[ 1 ].position.set(100, 200, 100)
  lights[ 2 ].position.set(- 100, - 200, - 100)

  scene.add(lights[ 0 ])
  scene.add(lights[ 1 ])
  scene.add(lights[ 2 ])
}

function createTable () {
  var geometry = new THREE.CylinderBufferGeometry(80, 79, 3, 60)
  var material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('assets/images/textures/table.jpg') })
  table = new THREE.Mesh(geometry, material)
  scene.add(table)
}
