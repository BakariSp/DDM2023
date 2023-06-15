import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

let camera1, cameraTarget1, scene1, renderer1, lastFrameTime = 0, numFrames = 10, resizeScale = 0.6;
const frameInterval = 1000 / 60;
let lampMesh;
let rectLight;

let x, y, z;

let pointLight = new THREE.PointLight(0xffffff);
pointLight.castShadow = true;
pointLight.decay = 1; // higher value for faster falloff
pointLight.position.set(0, 50, 50);

let time = 0;
const radius = 10;

function animate() {
    requestAnimationFrame(animate);

    x=1;
    y=1;
    z=1;

    // x = 0;
    // y = Math.sin(time) * radius + 10;
    // z = Math.cos(time) * radius + 10;

    // Update the position of the point light and the bulb
    pointLight.position.set(x - 0.5, y+0.5, z - 1 );
    rectLight.position.set(x, y, z);
    // bulb.position.set(x, y, z);
    lampMesh.position.set(x - 0.5, y +0.5, z - 1);

    time += 0.01;

    renderer1.render(scene1, camera1);
    return x, y, z;
}



function setupCanvas() {
    const canvas = document.getElementById('renderCanvas0');
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return canvas;
}

function setupRenderer(canvas) {
    
    renderer1 = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer1.setPixelRatio( window.devicePixelRatio );
    renderer1.setSize(window.innerWidth * resizeScale, window.innerHeight * resizeScale);
    renderer1.setClearColor(0xffffff, 1);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
    camera1.aspect = window.innerWidth / window.innerHeight;
    camera1.updateProjectionMatrix();
    renderer1.setSize(window.innerWidth * resizeScale, window.innerHeight * resizeScale);
}

function setupScene() {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 10000; // Increased from a smaller value
    camera1 = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
    camera1.position.set( 3, 0.15, 3 );
    cameraTarget1 = new THREE.Vector3( 0, 0, 0 );
    scene1 = new THREE.Scene();
    // scene1.fog = new THREE.Fog( 0xcccccc, 10, 15 );
    scene1.fog = new THREE.Fog( 0x72645b, 20, 50 );
    // ... add lights and other scene objects ...

    const color = 0xffffff;
    const intensity = 0.8;
    const light1 = new THREE.DirectionalLight(color, intensity);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light1.position.set(0.3, 0.3, 0);
    light2.position.set(0, 0, 0.3);
    // scene1.add(light1);
    // scene1.add(light2);

    const pointLightHelper = new THREE.PointLightHelper ( pointLight );
    pointLight.add( pointLightHelper );

    // scene1.add(pointLight);
    // scene1.add(bulb);

    const width = 10;
    const height = 10;
    rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
    rectLight.position.set(x, y, z);
    rectLight.lookAt( 0, 0, 0 );
    
    const rectLightHelper = new RectAreaLightHelper( rectLight );
    rectLight.add( rectLightHelper );
    scene1.add( rectLight )



    // Add an ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    // scene1.add(ambientLight);

}

function setupOrbitControls() {
    let orbit = new THREE.Object3D();
    orbit.add(camera1);
    scene1.add(orbit);
    let controls = new OrbitControls(camera1, renderer1.domElement);
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
    

    
    // loader.load('./models/ply/ascii/scene01.ply', function (geometry) {
    //     geometry.computeVertexNormals();
    
    //     // Create the EdgesGeometry for the model
    //     const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
    //     // Create a LineBasicMaterial for the edges with white color
    //     const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xA9A9A9 });
    
    //     // Create a LineSegments mesh using the edges geometry and material
    //     const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
    //     // Scale and rotate the edges mesh to match the original model
    //     edgesMesh.rotation.x = -Math.PI / 2;
    //     edgesMesh.scale.multiplyScalar(0.25);
    //     edgesMesh.position.set(5, -.5, 5);
    
    //     // Add the edges mesh to the scene
    //     scene1.add(edgesMesh);
    // });
    
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
        lampMesh.scale.multiplyScalar(0.25);
        lampMesh.position.set(0, 0, 0);
    
        // Add the edges mesh to the scene
        scene1.add(lampMesh);
    });

    // loader.load('./models/ply/ascii/lamp_light.ply', function (geometry) {
    //     geometry.computeVertexNormals();
    
    //     const edgesMaterial = new THREE.MeshPhysicalMaterial({ color: 0xA9A9A9 });
    //     lampMesh = new THREE.Mesh(geometry, edgesMaterial);
    
    //     lampMesh.rotation.x = -Math.PI / 2;
    //     lampMesh.scale.multiplyScalar(0.25);
    //     lampMesh.position.set(0, 0, 0);
    
    //     scene1.add(lampMesh);
    
    //     // Add a light source at the position of the lampMesh
    //     const pointLight = new THREE.PointLight(0xFFFFFF);
    //     pointLight.position.set(lampMesh.position.x, lampMesh.position.y, lampMesh.position.z);
    //     scene1.add(pointLight);
    // });
    
      
     
      
      

    // loader.load('./models/ply/ascii/scene01.ply', function (geometry) {
    //     geometry.computeVertexNormals();
    
    //     // Create the EdgesGeometry for the model
    //     // const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
    //     // Create a LineBasicMaterial for the edges with white color
    //     const edgesMaterial = new THREE.MeshPhongMaterial({ color: 0xA9A9A9 });
    
    //     // Create a LineSegments mesh using the edges geometry and material
    //     const edgesMesh = new THREE.Mesh(geometry, edgesMaterial);
    
    //     // Scale and rotate the edges mesh to match the original model
    //     edgesMesh.rotation.x = -Math.PI / 2;
    //     edgesMesh.scale.multiplyScalar(0.25);
    //     edgesMesh.position.set(5, -.5, 5);
    
    //     // Add the edges mesh to the scene
    //     scene1.add(edgesMesh);
    // });

    /*
    gltfloader.load(
        './models/scene/scene01.gltf',
        function (gltf) {
        scene1.add(gltf.scene);
        gltf.scene.scale.multiplyScalar(0.25);
        gltf.scene.position.set(0, 0, 0);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );
    */

    gltfloader.load(
        './models/gltf/test/test_division.glb',
        function (gltf) {
            gltf.scene.scale.multiplyScalar(1);
            gltf.scene.position.set(0.5, -0.5, 0.5);
            //set material
            var material = new THREE.MeshStandardMaterial({ color: 0xA9A9A9, side: THREE.DoubleSide });
            gltf.scene.traverse(function(node) {
                if (node.isMesh) {
                node.material = material;
                }
            });
            scene1.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );

    // gltfloader.load(
    //     './models/scene/scene01.gltf',
    //     function (gltf) {
    //     gltf.scene.scale.multiplyScalar(0.1);
    //     gltf.scene.position.set(0.5, -0.5, 0.5);
        
        
    //     //set material
    //     var material = new THREE.MeshStandardMaterial({ color: 0xA9A9A9, side: THREE.DoubleSide });
    //     gltf.scene.traverse(function(node) {
    //         if (node.isMesh) {
    //           node.material = material;
    //         }
    //       });

    //     scene1.add(gltf.scene);
    //     },
    //     undefined,
    //     function (error) {
    //     console.error('An error happened', error);
    //     }
    // );

    
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

    /*
    gltfloader.load(
        './models/gltf/test/000.gltf',
        function (gltf) {
        gltf.scene.scale.multiplyScalar(0.3);
        gltf.scene.position.set(0.5, -0.5, 0.5);
        scene.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );*/
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
        renderer1.setSize(window.innerWidth * resizeScale, window.innerHeight * resizeScale);
    });
}

function animateScene1(time) {
    camera1.lookAt(cameraTarget1);
    const elapsedTime = time - lastFrameTime;
    if (elapsedTime >= frameInterval) {
        renderer1.render(scene1, camera1);
        lastFrameTime = time;
    }
    requestAnimationFrame(animateScene1);
}

function op_change(mesh){
    var scrollPos = window.scrollY;
    mesh.emissiveIntensity  = scrollPos%1000 / 1000;
}

function init() {
    const canvas = setupCanvas();
    setupRenderer(canvas);
    setupScene();
    setupOrbitControls();
    loadModels();
    scene1.add(camera1);
    handleResize();
    animateScene1(performance.now());
    animate();
}

init();


  