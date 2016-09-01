var scene
var camera
var world
var renderer
var table
var io
var socket

$(function () {
  setup3d()
  buildWorld()
  render()
  connectToSocket()
})

function connectToSocket() {
  socket = io.connect();
  socket.on('connect', function () {
    console.log('connected')
  });
}

function setup3d () {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  world = new THREE.Object3D()

  scene.add(world)

  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor( 0xCCCC00 );
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
  var geometry = new THREE.CylinderBufferGeometry(5, 5, 20, 32)
  var material = new THREE.MeshBasicMaterial({color: 0xffff00})
  table = new THREE.Mesh(geometry, material)
  scene.add(table)
}
