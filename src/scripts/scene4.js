import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import Stats from 'three/addons/libs/stats.module.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RectAreaLightUniformsLib } from './RectAreaLightUniformsLib.js';
import TWEEN from '@tweenjs/tween.js';

RectAreaLightUniformsLib.init();

let camera1, cameraTarget1, scene1, renderer1, lastFrameTime = 0, resizeScale = 0.6;
let annotations = {};
let controls;
let x, y, z;
let i=0;
let pointLight = new THREE.PointLight(0xffffff);

const frameInterval = 1000 / 60;
const annotationMarkers = []
const targetObject = new THREE.Object3D();
const raycaster = new THREE.Raycaster()

targetObject.position.set(0, 0, 50);
pointLight.castShadow = true;
pointLight.decay = 1; // higher value for faster falloff
pointLight.position.set(0, 50, 50);


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// const progressBar = document.getElementById('progressBar')

let time = 0;

function init() {
    const canvas = setupCanvas();
    setupRenderer(canvas);
    setupScene();
    setupLights();
    setupOrbitControls();
    renderer1.domElement.addEventListener('click', onClick, false)
    loadModels();
    changeScene();
    scene1.add(camera1);
    handleResize();
    animateScene1(performance.now());
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    x = -20;
    y = 10;
    z = 10;

    // Update the position of the point light and the bulb
    // pointLight.position.set(x - 0.5, y+0.5, z - 1 );
    // rectLight.position.set(x - 0.2 , y , z );
    // spotLight.position.set(x , y , z - 0.2);
    
    targetObject.position.set(x+100, y-10, z);

    // spotLight.target = targetObject;
    // bulb.position.set(x, y, z);
    // if(lampMesh.isMesh){
    //     lampMesh.position.set(x, y, z);
    // }
    time += 0.01;
    renderer1.render(scene1, camera1);

    // const stats = new Stats()
    // document.body.appendChild(stats.dom)

    controls.update();
    TWEEN.update();
    // stats.update();
}


function setupCanvas() {
    const canvas = document.getElementById('renderCanvas0');
    // document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return canvas;
}

function setupRenderer(canvas) {
    const canvasContainer = document.getElementById('canvas-container');
    const width = canvasContainer.offsetWidth;
    const height = canvasContainer.offsetHeight;
  
    renderer1 = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer1.setPixelRatio(window.devicePixelRatio);
    renderer1.setSize(width, height);
    renderer1.setClearColor(0xDDDDDD, 1);
    renderer1.shadowMap.enabled = true;
    canvasContainer.appendChild(renderer1.domElement);
}

function setupScene() {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 10000; // Increased from a smaller value
    camera1 = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
    camera1.position.set( -0.11, 3.29, 5.47 );
    cameraTarget1 = new THREE.Vector3( 0, 0, 0 );
    scene1 = new THREE.Scene();
    scene1.fog = new THREE.Fog( 0xffffff, 20, 100 );
}

function setupLights() {
    const light = new THREE.AmbientLight( 0x404040, 2 ); // soft white light
    scene1.add( light );

    const Hemilight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene1.add( Hemilight );
}

function setupOrbitControls() {
    let orbit = new THREE.Object3D();
    orbit.add(camera1);
    scene1.add(orbit);
    controls = new OrbitControls(camera1, renderer1.domElement);
    controls.dampingFactor = 0.2
    controls.enableDamping = true
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
    };
    
}

function loadTextures(){
    const textureLoader = new THREE.TextureLoader();
    const gltfloader = new GLTFLoader();
    //textured models
    textureLoader.load('./models/img/img.jpg', function(texture){
        // Load a GLTF or GLB resource
        gltfloader.load(
            './models/gltf/board.gltf',
            function ( gltf ) {
                gltf.scene.scale.multiplyScalar(0.1);
                gltf.scene.position.set(-0.5, -0.5, 0.5);
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
                        child.material.needsUpdate = true;
                    }
                });
                scene1.add( gltf.scene );
            },
            undefined,
            function ( error ) {
                console.error( error );
            }
        );
    });


    textureLoader.load('./models/img/img.jpg', function(texture){

        // The image has a size of 477x601 pixels.
        const imageWidth = 100;
        const imageHeight = 150;

        // Create a plane geometry with the same aspect ratio as the image
        var geometry = new THREE.PlaneGeometry(imageWidth / 100, imageHeight / 100);

        // Create a MeshBasicMaterial with the loaded texture
        var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

        // Combine geometry and material to a mesh
        var mesh = new THREE.Mesh(geometry, material);

        // Add the mesh to the scene
        scene1.add(mesh);
    });
}


function loadModels() {
    const loader = new PLYLoader();
    const gltfloader = new GLTFLoader();


    loader.load('./models/ply/ascii/0627polygan.ply', function (geometry) {
        geometry.computeVertexNormals();
    
        
        // Create the EdgesGeometry for the model
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
        // Create a LineBasicMaterial for the edges with white color
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    
        // Create a LineSegments mesh using the edges geometry and material
        const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
        // Scale and rotate the edges mesh to match the original model
        edgesMesh.rotation.x = -Math.PI / 2;
        edgesMesh.scale.multiplyScalar(0.1);
        edgesMesh.position.set(0.5, -0.5, 0.5);
        // edgesMesh.castShadow = true;
        // edgesMesh.receiveShadow = true;
        scene1.add(edgesMesh);

        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    });

    // gltfloader.load(
    //     './models/gltf/s3/s3.gltf',
    //     function (gltf) {
    //     gltf.scene.scale.multiplyScalar(1);
    //     gltf.scene.position.set(0.5, -0.5, 0.5);
    //     scene1.add(gltf.scene);
    //     },
    //     undefined,
    //     function (error) {
    //     console.error('An error happened', error);
    //     }
    // );
}

function changeScene(){
    const annotationsDownload = new XMLHttpRequest();
    annotationsDownload.open('GET', 'json/annotation4.json');
    annotationsDownload.onreadystatechange = function () {
        if (annotationsDownload.readyState === 4) {
            const annotations = JSON.parse(annotationsDownload.responseText);
            const view1 = document.getElementById('view1');
            const view2 = document.getElementById('view2');
            const view3 = document.getElementById('view3');
            const view4 = document.getElementById('view4');

            var timer = window.setInterval( 
                function nextScene() { 
                    if (i < 4){
                        gotoAnnotation(annotations[i])
                        i ++;
                    } else {
                        i = 0;
                    }
                }, 5000)

            view1.addEventListener('click', function () {
                gotoAnnotation(annotations[0]);
                window.clearInterval(timer);
            });

            view2.addEventListener('click', function () {
                gotoAnnotation(annotations[1]);
                window.clearInterval(timer);
            });

            view3.addEventListener('click', function () {
                gotoAnnotation(annotations[2]);
                window.clearInterval(timer);
            });

            view4.addEventListener('click', function () {
                gotoAnnotation(annotations[3]);
                window.clearInterval(timer);
            });

            
            
            // progressBar.style.display = 'none';
        }
    };
    annotationsDownload.send();
}

function onClick(event) {
    raycaster.setFromCamera(
        {
            x: (event.clientX / renderer1.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / renderer1.domElement.clientHeight) * 2 + 1,
        },
        camera1
    )

    const intersects = raycaster.intersectObjects(annotationMarkers, true)
    if (intersects.length > 0) {
        if (intersects[0].object.userData && intersects[0].object.userData.id) {
            gotoAnnotation(annotations[intersects[0].object.userData.id])
        }
    }
}

function loadVideo(scene, videoSrc, width, height, posX, posY, posZ, scale) {
    // Create video element
    var video = document.createElement('video');

    // Set video source
    video.src = videoSrc;
    video.loop = true; 
    video.muted = true; 
    // Start loading data
    video.load(); 

    // Play video
    video.play();

    // Create video texture
    var videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    // Create a basic material with video texture
    var videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture, side: THREE.DoubleSide
    });

    // Create a plane geometry for the video
    var geometry = new THREE.PlaneGeometry(width, height); 

    // Create a mesh with geometry and material
    var mesh = new THREE.Mesh(geometry, videoMaterial);
    mesh.position.set(posX, posY, posZ);
    mesh.scale.multiplyScalar(scale);

    // Add the mesh to your scene
    scene.add(mesh);
    document.addEventListener('click', function() {
        // When the user clicks on the document, play the video
        video.play();
    });
}

function handleResize() {
    window.addEventListener('resize', () => {
        camera1.aspect = window.innerWidth / window.innerHeight;
        camera1.updateProjectionMatrix();
        const canvasContainer = document.getElementById('canvas-container');
        const width = canvasContainer.offsetWidth;
        const height = canvasContainer.offsetHeight;
        renderer1.setSize(width, height);
        // labelRenderer.setSize(window.innerWidth, window.innerHeight);

    });
}

function animateScene1(time) {
    camera1.lookAt(cameraTarget1);
    const elapsedTime = time - lastFrameTime;
    if (elapsedTime >= frameInterval) {
        renderer1.render(scene1, camera1);
        // labelRenderer.render(scene1, camera1);
        lastFrameTime = time;
    }
    // console.log('camera target:', camera1.getWorldDirection(cameraTarget1));
    // console.log('camera pos:',camera1.position);
    requestAnimationFrame(animateScene1);
}

function gotoAnnotation(a) {
    new TWEEN.Tween(camera1.position)
        .to(
            {
                x: a.camPos.x,
                y: a.camPos.y,
                z: a.camPos.z,
            },
            500
        )
        .easing(TWEEN.Easing.Cubic.Out)
        .start()

    new TWEEN.Tween(controls.target)
        .to(
            {
                x: a.lookAt.x,
                y: a.lookAt.y,
                z: a.lookAt.z,
            },
            500
        )
        .easing(TWEEN.Easing.Cubic.Out)
        .start()

    Object.keys(annotations).forEach((annotation) => {
        if (annotations[annotation].descriptionDomElement) {
            annotations[annotation].descriptionDomElement.style.display = 'none'
        }
    })
    if (a.descriptionDomElement) {
        a.descriptionDomElement.style.display = 'block'
    }
}

init();


  