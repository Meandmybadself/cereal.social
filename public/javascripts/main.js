var scene
var camera
var world
var renderer
var table
var io
var socket
var cereals
var hasInit
var domEvents
var useShadows = false

var SCALE = 0.9
var BOX_WIDTH = 14 * SCALE
var BOX_HEIGHT = 18 * SCALE
var BOX_DEPTH = 3 * SCALE

var GAP = .5

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
  'smorz': {color: 0x00A9CF},
  'crispix': {color: 0x044A83},
  'cinnamon-life': {color: 0x51A9DF},
  'chocolate-cheerios': {color: 0x391D18},
  'waffle-crisp': {color: 0xD7A900},
  'boo-berry': {color: 0x0068A5},
  'honey-smacks': {color: 0xD2272A},
  'corn-pops': {color: 0xFEF100},
  'golden-grahams': {color: 0xFFFC41},
  'cocoa-pebbles': {color: 0x4B221F},
  'count-chocula': {color: 0x3D1F16},
  'reeses-puffs': {color: 0xFB781D},
  'cookie-crisp': {color: 0xFFFFFF},
  'capn-crunch': {color: 0xFF382A},
  'honey-nut-cheerios': {color: 0xFCC930},
  'krave': {color: 0xFFFFFF},
  'raisin-bran': {color: 0xAF1F91},
  'wheaties': {color: 0xE33600},
  'apple-jacks': {color: 0x00CB31},
  'froot-loops': {color: 0xF32016},
  'special-k': {color: 0xFFFFFF},
  'rice-krispies': {color: 0x00A0D3},
  'kix': {color: 0xF4782F},
  'berry-berry-kix': {color: 0x7C1A82},
  'frosted-flakes': {color: 0x0563B3},
  'lucky-charms': {color: 0xEF2029},
  'frosted-cheerios': {color: 0x0070B8},
  'cheerios': {color: 0xFCCC03},
  'cinnamon-toast-crunch': {color: 0xFFFFFF},
  'fruity-pebbles': {color: 0xFF0000},
  'cocoa-puffs': {color: 0x441413}
}

function rad2deg (radians) {
  return radians * (180 / Math.PI)
}
function deg2rad (degrees) {
  return degrees * (Math.PI / 180)
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
        var y = (BOX_DEPTH * 0.5) + (TABLE_HEIGHT * 0.5)
        var z = -(startY / 2) + (BOX_HEIGHT * row) + (GAP * row)
        // console.log(index,x,y,z)
        return new THREE.Vector3(x, y, z)
      }
    }
  }
}

function getBox (id) {
  var textureLoader = new THREE.TextureLoader()
  var texPath = '/assets/images/textures/cereals/' + id + '.jpg'
  var box = new THREE.BoxBufferGeometry(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH, 1, 1, 1)
  var color = cerealColors[id].color
  var shininess = 10
  var flatMat = new THREE.MeshLambertMaterial({color: color})
  // var flatMat = new THREE.MeshPhongMaterial({ color: color, specular: color, shininess: shininess, shading: THREE.FlatShading })
  var mat = new THREE.MultiMaterial([
    flatMat,
    flatMat,
    flatMat,
    flatMat,
    flatMat,
    new THREE.MeshBasicMaterial({map: textureLoader.load(texPath)}),
    flatMat
  ])
  var mesh = new THREE.Mesh(box, mat)
  mesh.castShadow = useShadows
  mesh.rotation.x = deg2rad(90)

  return mesh
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

function onBoxMouseover(e) {}
function onBoxMouseout(e) {}

function addBoxes (id, count) {
  var mesh = getBox(id)

  for (var i = 0; i < count; i++) {
    var m = mesh.clone()
    domEvents.addEventListener(m, 'mouseover', function(e) {
      console.log('mouseover', e)
    })
    var col = getShortestColumn(id)
    var kidsLen = col.children.length
    m.position.y = kidsLen * BOX_DEPTH
    m.rotation.z = deg2rad(randomBetween(-5, 5))
    col.add(m)
    TweenMax.from(m.position, 0.3, {y: 200,ease: Quad.easeOut})
    TweenMax.from(m.rotation, 0.3, {x: deg2rad(10),ease: Quad.easeOut})
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
      // Build the columns.
      var index = 0

      cereals = {}
      ll = data.length

      // while(ll--) {
      for (var d = 0; d < ll; d++) {
        var c = data[d]
        var ct = c.count
        var colCt
        var cols = []

        if (ct >= 700) {
          colCt = 11
        } else if (ct >= 600) {
          colCt = 10
        } else if (ct >= 500) {
          colCt = 9
        } else if (ct >= 400) {
          colCt = 8
        } else if (ct >= 300) {
          colCt = 7
        } else if (ct >= 200) {
          colCt = 6
        } else if (ct >= 100) {
          colCt = 4
        } else if (ct >= 50) {
          colCt = 3
        } else if (ct >= 20) {
          colCt = 1
        }

        for (var i = 0; i < colCt; i++) {
          var do3d = new THREE.Object3D()
          var p = getPosition(index++)
          do3d.position.x = p.x
          do3d.position.y = p.y
          do3d.position.z = p.z
          cols.push(do3d)
          world.add(do3d)
        }

        cereals[c['_id']] = {columns: cols, count: 0}
      }
      hasInit = true
    }

    ll = data.length
    while(ll--) {
      var id = data[ll]['_id']
      var diff = data[ll].count - cereals[id].count
      cereals[id].count = data[ll].count
      if (diff > 0) {
        addBoxes(id, diff)
      } else if (diff < 0) {
        removeBoxes(id, diff)
      }
    }
  })
}

function setup3d () {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 12000)
  camera.position.z = 260
  camera.position.y = 280
  camera.rotation.x = deg2rad(-43)
  world = new THREE.Object3D()

  scene.add(world)

  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.shadowMapEnabled = useShadows
  // renderer.setClearColor(0x779194)
  renderer.setClearColor(0x111111)
  renderer.setSize(window.innerWidth, window.innerHeight)
  //
  // var width = window.innerWidth || 2;
	// var height = window.innerHeight || 2;
  // var rtWidth  = width / 2;
	// var rtHeight = height / 2;
  // var effectHBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader)
  // var effectVBlur = new THREE.ShaderPass(THREE.VerticalBlurShader)
  // effectHBlur.uniforms[ 'h' ].value = 2 / (width / 2)
  // effectVBlur.uniforms[ 'v' ].value = 2 / (height / 2)
  //
  // composerScene = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(rtWidth * 2, rtHeight * 2, rtParameters))
  // composerScene.addPass(effectHBlur)
  // composerScene.addPass(effectVBlur)

  //var orbit = new THREE.OrbitControls(camera, renderer.domElement)
  //orbit.enableZoom = false

  domEvents	= new THREEx.DomEvents(camera, renderer.domElement)


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
  var r = rad2deg(world.rotation.y) + 0.3

  world.rotation.y = deg2rad(r)
}

function buildWorld () {
  setupLights()
  loadWorld()
  //createTable()
}

function setupLights () {
  var ambientLight = new THREE.AmbientLight(0x333333)
  //world.add(ambientLight)

  var lights = []
  lights[ 0 ] = new THREE.PointLight(0xFFFFFF, .5, 0)
  lights[ 1 ] = new THREE.PointLight(0xFFFFFF, .5, 0)
  lights[ 2 ] = new THREE.PointLight(0xFFFFFF, .5, 0)
  lights[ 0 ].position.set(0, 200, 0)
  lights[ 1 ].position.set(100, 200, 100)
  lights[ 2 ].position.set(-100, -200, -100)

  lights[0].castShadow = useShadows
  lights[1].castShadow = useShadows
  lights[2].castShadow = useShadows

  world.add(lights[ 0 ])
  world.add(lights[ 1 ])
  world.add(lights[ 2 ])

  hemiLight = new THREE.HemisphereLight( 0xCCCCCC, 0x999999, .5 );
  hemiLight.castShadow = useShadows
  world.add(hemiLight)
}

function loadWorld() {
  $.ajax({
    //dataType:'json',
    url:'/assets/geometry/scene.json',
    success: function(js,stat) {
      if (stat === "success") {
        var loader = new THREE.ObjectLoader()
        var obj = loader.parse(js)
        obj.scale.x =
        obj.scale.y =
        obj.scale.z = 35
        obj.castShadow = useShadows
        world.add(obj)

        // Skin em.
        var table = scene.getObjectByName("Tabletop")
        console.log(table)

      }
    }
  })

}
