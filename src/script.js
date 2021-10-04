import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => 
{
// Update sizes
sizes.width = window.innerWidth
sizes.height = window.innerHeight

// Update Camera
camera.aspect = sizes.width / sizes.height
camera.updateProjectionMatrix()

// Update renderer
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
scene.add(camera)


/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Mouse Coordinates
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / sizes.width * 2 - 1
  mouse.y = - (e.clientY / sizes.height) * 2 + 1
})


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.x = 1
directionalLight.position.y = 1
directionalLight.position.z = 2
scene.add(directionalLight)
 
 /*const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
 scene.add(directionalLightHelper)*/


/**
 * Textures
 */
/* 
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const texture1 = textureLoader.load('/textures/color1.jpg') 
const texture2 = textureLoader.load('/textures/color2.jpg')

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)
const cubeTextureEnvironment = cubeTextureLoader.load([
  '/textures/px.jpg',
  '/textures/nx.jpg',
  '/textures/py.jpg',
  '/textures/ny.jpg',
  '/textures/pz.jpg',
  '/textures/nz.jpg',
])
*/


/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.82, 0)

const plasticMaterial = new CANNON.Material('plastic')

const plasticAndPlasticContactMaterial = new CANNON.ContactMaterial(
  plasticMaterial,
  plasticMaterial,
  {
    friction: 0.005,
    restitution: 0
  }
)
world.addContactMaterial(plasticAndPlasticContactMaterial)

const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0
  }
)

world.defaultContactMaterial = defaultContactMaterial

const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const planeShape = new CANNON.Plane()

const boxBodyLeft = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(-0.8, 1.3, 0.2),
  shape: boxShape,
  material: plasticMaterial
})
world.addBody(boxBodyLeft)

const boxBodyCenter = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 0, 0),
  shape: boxShape,
  material: plasticMaterial
})
world.addBody(boxBodyCenter)

const boxBodyRight = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0.8, 2, -0.5),
  shape: boxShape,
  material: plasticMaterial
})
world.addBody(boxBodyRight)

const planeBody = new CANNON.Body({
  mass: 0,
  shape: planeShape,
  material: plasticMaterial
})
planeBody.position.y = -1
planeBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1, 0, 0),
  Math.PI * 0.5
)
world.addBody(planeBody)


/**
 * Objects
 */
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const planeGeometry = new THREE.PlaneGeometry(100, 100)

const materialLeftColor = '#f1faee'
const materialCenterColor = '#a8dadc'
const materialRightColor = '#457b9d'
const materialActiveColor = '#e63946'

const materialLeft = new THREE.MeshStandardMaterial({ color: materialLeftColor })
const materialCenter = new THREE.MeshStandardMaterial({ color: materialCenterColor })
const materialRight = new THREE.MeshStandardMaterial({ color: materialRightColor })
const materialFloor = new THREE.MeshStandardMaterial({ color: '#1d3557' })

const meshLeft = new THREE.Mesh(boxGeometry, materialLeft)
meshLeft.position.x = -1.60
meshLeft.body = boxBodyLeft

const meshCenter = new THREE.Mesh(boxGeometry, materialCenter)
meshCenter.position.x = 0
meshCenter.body = boxBodyCenter

const meshRight = new THREE.Mesh(boxGeometry, materialRight)
meshRight.position.x = 1.60
meshRight.body = boxBodyRight

const meshFloor = new THREE.Mesh(planeGeometry, materialFloor)
meshFloor.rotation.x = -Math.PI * 0.5
meshFloor.position.y = -1

scene.add(meshFloor, meshLeft, meshCenter, meshRight)


/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
const raycastTargets = [meshLeft, meshCenter, meshRight]
let currentIntersect = null


/**
 * Interactions
 */

// highlight item on / off returning back to its original color
/* let isActive = []

window.addEventListener('click', () => {
  // currentIntersect is being set in the tick function on each frame
  if (currentIntersect) {
    console.log('intersect got a click', currentIntersect)

    if (!isActive.find((i) => i === currentIntersect.object)) {
      currentIntersect.object.material.color.set(materialActiveColor)
      isActive.push(currentIntersect.object)
    } else {
      switch(currentIntersect.object) {
        case meshLeft:
          currentIntersect.object.material.color.set(materialLeftColor)
          break
        case meshCenter:
          currentIntersect.object.material.color.set(materialCenterColor)
          break
        case meshRight:
          currentIntersect.object.material.color.set(materialRightColor)
          break
      }
      isActive = isActive.filter((i) => i !== currentIntersect.object)
    }
  }
}) */

// click on item to move it applying a forze using physics
window.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera)
  const raycastIntersects = raycaster.intersectObjects(raycastTargets)

  if (raycastIntersects.length) {
    const currentIntersect = raycastIntersects[0]
    const { object, point } = currentIntersect

    const forceDirection = new THREE.Vector3().subVectors(object.position, camera.position).normalize().multiplyScalar(150)

    const forcePoint = new THREE.Vector3().subVectors(point, object.position)

    object.body.applyForce(new CANNON.Vec3().copy(forceDirection), new CANNON.Vec3().copy(forcePoint))
  }
  
})


/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  //Objects animations
  /* meshLeft.rotation.y = elapsedTime * 0.5
  meshCenter.rotation.y = elapsedTime * 0.5
  meshRight.rotation.y = elapsedTime * 0.5 */

  // Raycast to iterate over elements and assign a property if hovered, if not returns to its original state
  // executes on each frame
  /* raycaster.setFromCamera(mouse, camera)
  const raycastIntersects = raycaster.intersectObjects(raycastTargets) */

  /* for (const target of raycastTargets) {
    target.material.color.set('#0000ff') // original color
    // add function here
  }
  for (const intersect of raycastIntersects) {
    intersect.object.material.color.set('#e63946') // color if intersects
    // add function here
  } */

  // mouse enter / mouse leave , will change the color of the hovered element but wont execute on each frame
  /* if (raycastIntersects.length) {
    if (currentIntersect === null) {
      console.log('mouse enter')
      currentIntersect = raycastIntersects[0]
      // add function here
    }    
  } else {
    if (currentIntersect) {
      console.log('mouse leave')
      currentIntersect = null
      // add function here
    }
  } */

  // Update physics world
  world.step(1/60 /** 60FPS */, deltaTime /** Delta Time */, 3 /** Iterations */)

  // Apply physics to objects 
  meshLeft.position.copy(boxBodyLeft.position)
  meshCenter.position.copy(boxBodyCenter.position)
  meshRight.position.copy(boxBodyRight.position)

  meshLeft.quaternion.copy(boxBodyLeft.quaternion)
  meshCenter.quaternion.copy(boxBodyCenter.quaternion)
  meshRight.quaternion.copy(boxBodyRight.quaternion)
  
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
 
 tick()
