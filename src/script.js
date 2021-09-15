import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CANNON from 'cannon'

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
world.gravity.set(0, -9.82, 0)


/**
 * Objects
 */
const sphereGeometry = new THREE.SphereGeometry(0.5, 10, 10)
const planeGeometry = new THREE.PlaneGeometry(10, 10)

const materialLeftColor = '#f1faee'
const materialCenterColor = '#a8dadc'
const materialRightColor = '#457b9d'
const materialActiveColor = '#e63946'

const materialLeft = new THREE.MeshStandardMaterial({ color: materialLeftColor })
const materialCenter = new THREE.MeshStandardMaterial({ color: materialCenterColor })
const materialRight = new THREE.MeshStandardMaterial({ color: materialRightColor })
const materialFloor = new THREE.MeshStandardMaterial({ color: '#1d3557' })

const meshLeft = new THREE.Mesh(sphereGeometry, materialLeft)
meshLeft.position.x = -1.60

const meshCenter = new THREE.Mesh(sphereGeometry, materialCenter)
meshCenter.position.x = 0

const meshRight = new THREE.Mesh(sphereGeometry, materialRight)
meshRight.position.x = 1.60

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
let isActive = []

window.addEventListener('click', () => {
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
})


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
  const elapsedTime = clock.getElapsedTime()  

  //Objects animations
  /* meshLeft.rotation.y = elapsedTime * 0.5
  meshCenter.rotation.y = elapsedTime * 0.5
  meshRight.rotation.y = elapsedTime * 0.5 */

  //Raycast
  raycaster.setFromCamera(mouse, camera)
  const raycastIntersects = raycaster.intersectObjects(raycastTargets)

  // iterate over elements and assign a property if hovered, if not returns to its original state
  /* for (const target of raycastTargets) {
    target.material.color.set('#0000ff')
    // add function here
  }
  for (const intersect of raycastIntersects) {
    intersect.object.material.color.set('#e63946')
    // add function here
  } */

  // mouse enter / mouse leave  
  if (raycastIntersects.length) {
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
  }
  
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
 
 tick()
