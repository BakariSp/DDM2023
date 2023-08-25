import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { TexturePass } from 'three/addons/postprocessing/TexturePass.js';
import { ClearPass } from 'three/addons/postprocessing/ClearPass.js';
import { MaskPass, ClearMaskPass } from 'three/addons/postprocessing/MaskPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RectAreaLightUniformsLib } from './RectAreaLightUniformsLib.js';
import TWEEN from '@tweenjs/tween.js';

RectAreaLightUniformsLib.init();

let camera1, cameraTarget1, scene1, renderer1,  composer, lastFrameTime = 0, resizeScale = 0.6;
let textMesh, boxMesh;
let lampMesh = new THREE.Mesh();
let rectLight, spotLight;
let annotations = {};
let controls;
let x, y, z;
let change = true;
let pointLight = new THREE.PointLight(0xffffff);
let i=0;
let particles;

const frameInterval = 1000 / 60;
const annotationMarkers = []
const targetObject = new THREE.Object3D();
const raycaster = new THREE.Raycaster()
const sceneMeshes = new Array()
const canvasContainer = document.getElementById('canvas-container');
const numMeshes = [];
const numParticles = 10;
const centerPoint = new THREE.Vector3(0,0,0);
const rotationAxis = 'X'; // Change to 'X' or 'Y' as needed
// const radius = 8;

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
const radius = 10;

function init() {
    const canvas = setupCanvas();
    setupRenderer(canvas);
    setupScene();
    setupLights();
    setupOrbitControls();
    renderer1.domElement.addEventListener('click', onClick, false);
    document.addEventListener('mouseup', function () {
        change = true;
        console.log('mouse up');
        changeScene();
    });
    // loadModels();
    // scrollText();
    changeScene();
    loadNumbers();
    loadVideo(scene1, './models/video/output.mp4', 1, 17, -16.5, 7.5, 9,0.9);
    loadVideo(scene1, './models/video/output.mp4', 1, 17, -5.5, 7.5, 9,0.9);
    loadVideo(scene1, './models/video/output.mp4', 1, 17, 5.5, 7.5, 9,0.9);
    loadVideo(scene1, './models/video/output.mp4', 1, 17, 17, 7.5, 9,0.9);
    scene1.add(camera1);
    handleResize();
    animateScene1(performance.now());
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    x = -20;
    y = Math.sin(time*0.5) * radius + 10;
    z = Math.cos(time*0.5) * radius + 10;

    // Update the position of the point light and the bulb
    pointLight.position.set(x - 0.5, y+0.5, z - 1 );
    rectLight.position.set(x - 0.2 , y , z );
    spotLight.position.set(x , y , z - 0.2);
    
    targetObject.position.set(x+100, y-10, z);

    spotLight.target = targetObject;
    // bulb.position.set(x, y, z);
    if(lampMesh.isMesh){
        lampMesh.position.set(x, y, z);
    }
    time += 0.01;
    renderer1.render(scene1, camera1);

    // const stats = new Stats()
    // document.body.appendChild(stats.dom)

    controls.update();
    TWEEN.update();
    // stats.update();

    // renderer1.clear();
	// composer.render();
}


function setupCanvas() {
    const canvas = document.getElementById('renderCanvas0');
    // document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return canvas;
}

function setupRenderer(canvas) {
   
    const width = canvasContainer.offsetWidth;
    const height = canvasContainer.offsetHeight;
  
    renderer1 = new THREE.WebGLRenderer({ canvas, antialias: true , stencil: true});
    renderer1.setPixelRatio(window.devicePixelRatio);
    renderer1.setSize(width, height);
    renderer1.setClearColor(0x634400, 1);
    renderer1.shadowMap.enabled = true;
    canvasContainer.appendChild(renderer1.domElement);

    const parameters = {
        stencilBuffer: true,
    };
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters);
    composer = new EffectComposer(renderer1, renderTarget);
}

function setupScene() {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 10000; // Increased from a smaller value
    camera1 = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
    camera1.position.set( 16, 10, -9 );
    cameraTarget1 = new THREE.Vector3( 0, 0, 0 );
    scene1 = new THREE.Scene();
    // scene1.fog = new THREE.Fog( 0xcccccc, 10, 15 );
    scene1.fog = new THREE.Fog( 0x9e6003, 20, 50 );
    // ... add lights and other scene objects ...
}

function setupLights() {
    const color = 0xffffff;
    const intensity = 0.8;
    const light1 = new THREE.DirectionalLight(color, intensity);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light1.position.set(0.3, 0.3, 0);
    light2.position.set(0, 0, 0.3);

    const pointLightHelper = new THREE.PointLightHelper ( pointLight );
    pointLight.add( pointLightHelper );

    const width = 2.2;
    const height = 1.2;
    rectLight = new THREE.RectAreaLight( 0xffae36, 10,  width, height );
    rectLight.position.set(0, 0.1, 0);
    rectLight.lookAt( 1, 0, 0 );
    rectLight.decay = 2;
    scene1.add( rectLight );
    
    const rectLightHelper = new RectAreaLightHelper( rectLight );
    rectLight.add( rectLightHelper );

    spotLight = new THREE.SpotLight(0xffae36, 10);
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    spotLight.angle = Math.PI / 4; // Spread angle
    spotLight.penumbra = 0.15; // Controls the softness of the light's edge
    spotLight.decay = 3; // The amount the light dims along the distance of the light
    spotLight.distance = 200; // The maximum distance the light shines
    spotLight.shadow.mapSize.width = 512; // default is 512
    spotLight.shadow.mapSize.height = 512; // default is 512
    spotLight.shadow.camera.near = 0.5; // default
    spotLight.shadow.camera.far = 500; // default

    scene1.add(spotLight);
    scene1.add(targetObject);
}

function setupOrbitControls() {
    let orbit = new THREE.Object3D();
    orbit.add(camera1);
    scene1.add(orbit);
    controls = new OrbitControls(camera1, renderer1.domElement);
    controls.dampingFactor = 0.2
    // controls.enableDamping = true
    // controls.mouseButtons = {
    //     LEFT: THREE.MOUSE.PAN,
    //     MIDDLE: THREE.MOUSE.DOLLY,
    //     RIGHT: THREE.MOUSE.ROTATE
    // };
}


function scrollText() {
    const fontLoader = new FontLoader();
    fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

        const color = 0x006699;

        const matDark = new THREE.LineBasicMaterial( {
            color: color,
            side: THREE.DoubleSide
        } );

        const matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        } );

        const message = '   Three.js\nSimple text.';

        const shapes = font.generateShapes( message, 5);

        const geometry = new THREE.ShapeGeometry( shapes );

        geometry.computeBoundingBox();

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        geometry.translate( xMid, 0, 0 );

        // make shape ( N.B. edge view not visible )

        
        textMesh = new THREE.Mesh( geometry, matLite );
        textMesh.position.y =  30;
        scene1.add( textMesh );
        /*
        //add a new scene for box mask
        const scene2 = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(4, 4, 4);
		const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
		scene2.add(boxMesh);

        const clearPass = new ClearPass();
		const clearMaskPass = new ClearMaskPass();
		const maskPass1 = new MaskPass(scene1, camera1);
		const maskPass2 = new MaskPass(scene2, camera1);
		const outputPass = new OutputPass();

		composer.addPass(clearPass);
		composer.addPass(maskPass1);
		composer.addPass(maskPass2);
		composer.addPass(clearMaskPass);
		composer.addPass(outputPass);*/

        // renderer1.render();

    } ); //end load function
}

/*
function loadNumbers() {
    const fontLoader = new FontLoader();
    fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

        const color = 0x006699;

        const matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        } );

        const message = '   Three.js\nSimple text.';

        const shapes = font.generateShapes( message, 5);

        const geometry = new THREE.ShapeGeometry( shapes );

        geometry.computeBoundingBox();

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        geometry.translate( xMid, 0, 0 );

        // make shape ( N.B. edge view not visible )

        
        textMesh = new THREE.Mesh( geometry, matLite );
        textMesh.position.y =  30;
        scene1.add( textMesh );

        // renderer1.render();

    } ); //end load function
}*/

function loadNumbers() {
    const fontLoader = new FontLoader();

    fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function (font) {

        // Create an array to store geometries for numbers 1-9
        const numberGeometries = [];
        const positions = new Float32Array( numParticles * 3 );

        let count = 0;
        

        for (let i = 0; i < numParticles; i++) {
            const shapes = font.generateShapes((i % 9).toString(), 0.5);
            const geometry = new THREE.ShapeGeometry(shapes);
            numberGeometries.push(geometry);

            let theta = (Math.PI * 2 / numParticles) * i;

            if (rotationAxis === 'X') {
                positions[count] = centerPoint.x + radius * Math.cos(theta);
                positions[count + 1] = centerPoint.y;
                positions[count + 2] = centerPoint.z + radius * Math.sin(theta);
            } else if (rotationAxis === 'Y') {
                positions[count] = centerPoint.x + radius * Math.cos(theta);
                positions[count + 1] = centerPoint.y + radius * Math.sin(theta);
                positions[count + 2] = centerPoint.z;
            } else if (rotationAxis === 'Z') {
                positions[count] = centerPoint.x + radius * Math.cos(theta);
                positions[count + 1] = centerPoint.y + radius * Math.sin(theta);
                positions[count + 2] = centerPoint.z;
            }

            count += 3;
        }

        // Create a group to hold all the numbers
        const group = new THREE.Group();

        // Assume positions is an array of Vector3 representing the positions of the particles
        // const positions = [ /* ... your particle positions ... */ ];

        // Iterate through the particle positions
        for (let i = 0; i < numParticles; i++) {
            // Get the appropriate geometry
            const geometry = numberGeometries[i];
          
            // Create a mesh with the geometry and some material
            const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
          
            // Set the position
            mesh.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          
            // Add to the group
            group.add(mesh);
            numMeshes.push(mesh);
        }

        
        // Add the group to the scene
        scene1.add(group);
        // console.log(positions);

    } );

}

function updatePositions() {
    if( numMeshes.length > 0 ) {
        for (let i = 0; i < numParticles; i++) {
        // Calculate new positions, for example:
        const theta = (Math.PI * 2 / numParticles) * i + Date.now() * 0.0001;
        let x, y, z = 0;

        if (rotationAxis === 'X') {
            x = centerPoint.x + radius * Math.cos(theta);
            y = centerPoint.y;
            z = centerPoint.z + radius * Math.sin(theta);
        } else if (rotationAxis === 'Y') {
            x = centerPoint.x + radius * Math.cos(theta);
            y = centerPoint.y + radius * Math.sin(theta);
            z = centerPoint.z;
        } else if (rotationAxis === 'Z') {
            x = centerPoint.x + radius * Math.cos(theta);
            y = centerPoint.y + radius * Math.sin(theta);
            z = centerPoint.z;
        }
    
        // Update the mesh position
        numMeshes[i].position.set(x, y, z);
        numMeshes[i].lookAt(camera1.position);
        // numMeshes[i].rotation.z += Math.PI / 2;
        }
    }else{
        console.log("updating value");
    }
}


function loadModels() {
    const loader = new PLYLoader();
    const gltfloader = new GLTFLoader();
    

    loader.load('./models/ply/ascii/lamp.ply', function (geometry) {
        geometry.computeVertexNormals();
    
        // Create the EdgesGeometry for the model
        // const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
        // Create a LineBasicMaterial for the edges with white color
        const edgesMaterial = new THREE.MeshPhysicalMaterial({ color: 0xA9A9A9 });
    
        // Create a LineSegments mesh using the edges geometry and material
        lampMesh = new THREE.Mesh(geometry, edgesMaterial);
    
        // Scale and rotate the edges mesh to match the original model
        lampMesh.rotation.x = -Math.PI / 2;
        lampMesh.rotation.z = Math.PI / 2;
        lampMesh.scale.multiplyScalar(0.25);
        lampMesh.position.set(0, 0, 0);
    
        // Add the edges mesh to the scene
        scene1.add(lampMesh);
    });

    loader.load('./models/ply/ascii/scene01.ply', function (geometry) {
        geometry.computeVertexNormals();
    
        // Create the EdgesGeometry for the model
        // const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
        // Create a LineBasicMaterial for the edges with white color
        const edgesMaterial = new THREE.MeshPhysicalMaterial({ color: 0xA9A9A9 });
    
        // Create a LineSegments mesh using the edges geometry and material
        const edgesMesh = new THREE.Mesh(geometry, edgesMaterial);
    
        // Scale and rotate the edges mesh to match the original model
        edgesMesh.rotation.x = -Math.PI / 2;
        edgesMesh.scale.multiplyScalar(0.25);
        edgesMesh.position.set(5, -.5, 5);
        edgesMesh.castShadow = true;
        edgesMesh.receiveShadow = true;
    
        // Add the edges mesh to the scene
        scene1.add(edgesMesh);
        sceneMeshes.push(edgesMesh);
        (error) => {
            console.log('An error happened');
        }
        
    });

    gltfloader.load(
        './models/gltf/Sign.gltf',
        function (gltf) {
        gltf.scene.scale.multiplyScalar(1);
        gltf.scene.position.set(0.5, -0.5, 0.5);
        scene1.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );
}

function changeScene(){
    const annotationsDownload = new XMLHttpRequest();
    annotationsDownload.open('GET', 'json/annotation3.json');
    annotationsDownload.onreadystatechange = function () {
        if (annotationsDownload.readyState === 4) {
            const annotations = JSON.parse(annotationsDownload.responseText);
            
            const view1 = document.getElementById('view1');
            const view2 = document.getElementById('view2');
            const view3 = document.getElementById('view3');
            const view4 = document.getElementById('view4');
            const viewList = [view1, view2, view3, view4];

            if (change==true) {
                var timer = window.setInterval( 
                    function nextScene() { 
                        if (i < 4){
                            gotoAnnotation(annotations[i]);
                            for (let i = 0; i < viewList.length; ++i){
                                viewList[i].style.backgroundColor = 'yellow';
                                viewList[i].style.color = 'blue';
                            }
                            viewList[i].style.backgroundColor = 'blue';viewList[i].style.color = 'white';
                            i ++;
                        } else {
                            i = 0;
                        }
                }, 5000)
            } else {
                change = true;
            }

            window.addEventListener('mousedown',(event) => {
                change = false;
                window.clearInterval(timer);
                // console.log('change:', change);
            });

            view1.addEventListener('click', function () {
                gotoAnnotation(annotations[0]);
                changeColor(viewList, view1);
                window.clearInterval(timer);
            });

            view2.addEventListener('click', function () {
                gotoAnnotation(annotations[1]);
                changeColor(viewList, view2);
                window.clearInterval(timer);
            });

            view3.addEventListener('click', function () {
                gotoAnnotation(annotations[2]);
                changeColor(viewList, view3);
                window.clearInterval(timer);
            });

            view4.addEventListener('click', function () {
                gotoAnnotation(annotations[3]);
                changeColor(viewList, view4);
                window.clearInterval(timer);

            });

            
            
            // progressBar.style.display = 'none';
        }
    };
    annotationsDownload.send();
    // console.log('change:', change);
}

function changeColor(viewList, view) {
    for (let i = 0; i < viewList.length; ++i){
        viewList[i].style.backgroundColor = 'yellow';
        viewList[i].style.color = 'blue';
    }
    view.style.backgroundColor = 'blue';
    view.style.color = 'white';
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
        const width = canvasContainer.offsetWidth;
        const height = canvasContainer.offsetHeight;
        renderer1.setSize(width, height);
        // composer.setSize(width, height);
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
    updatePositions();
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

    cameraTarget1 = new THREE.Vector3( a.lookAt.x, a.lookAt.y, a.lookAt.z);

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

function createParticles() {
    const particleGeometry = new THREE.SphereBufferGeometry(1, 6,
        6);
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        sizeAtteuation: true,
    });
    const particle = new THREE.Points(particleGeometry, particleMaterial);
}

init();


  