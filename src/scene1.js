import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera1, cameraTarget1, scene1, renderer1, lastFrameTime = 0, numFrames = 10, resizeScale = 0.6;
const frameInterval = 1000 / 60;

function setupCanvas() {
    const canvas = document.getElementById('renderCanvas0');
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return canvas;
}

function setupRenderer(canvas) {
    
    renderer1 = new THREE.WebGLRenderer({ canvas, antialias: true });
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
    // scene.fog = new THREE.Fog( 0x72645b, 2, 15 );
    // ... add lights and other scene objects ...

    const color = 0xffffff;
    const intensity = 0.8;
    const light1 = new THREE.DirectionalLight(color, intensity);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light1.position.set(0.3, 0, 0);
    light2.position.set(0, 0, 0.3);
    scene1.add(light1);
    scene1.add(light2);

    // Add an ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene1.add(ambientLight);

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
    
    // textureLoader.load('./models/img/spritesheet.gif', function(texture) {
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //     texture.repeat.set(1 / numFrames, 1);

    //     var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    //     var geometry = new THREE.PlaneGeometry(600, 600);
    //     var mesh = new THREE.Mesh(geometry, material);
    //     scene.add(mesh);

    //     var currentFrame = 0;
    //     function animateGIF() {
    //         requestAnimationFrame(animate);
    //         renderer.render(scene, camera);
            
    //         // Update the spritesheet
    //         currentFrame = (currentFrame + 1) % numFrames;
    //         texture.offset.x = currentFrame / numFrames;
    //     }
    //     animateGIF();
    // });




    // Load your models using loaders...
    // loader.load('./models/ply/ascii/curve.ply', function (geometry) {
    //     geometry.computeVertexNormals();

    //     // Create the EdgesGeometry for the model
    //     const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
    //     // Create a LineBasicMaterial for the edges with white color
    //     const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xA9A9A9 });
    
    //     // Create a LineSegments mesh using the edges geometry and material
    //     const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
    //     // Scale and rotate the edges mesh to match the original model
    //     edgesMesh.rotation.x = -Math.PI / 2;
    //     edgesMesh.scale.multiplyScalar(0.01);
    //     edgesMesh.position.set(0.5, -0.5, 0.5);
    
    //     // Add the edges mesh to the scene
    //     scene.add(edgesMesh);
    // });

   
    /*
    loader.load('./models/ply/ascii/env_yuan.ply', function (geometry) {
        geometry.computeVertexNormals();
    
        // Create the EdgesGeometry for the model
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
        // Create a LineBasicMaterial for the edges with white color
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xA9A9A9 });
    
        // Create a LineSegments mesh using the edges geometry and material
        const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
        // Scale and rotate the edges mesh to match the original model
        edgesMesh.rotation.x = -Math.PI / 2;
        edgesMesh.scale.multiplyScalar(0.01);
        edgesMesh.position.set(0.5, -0.5, 0.5);
    
        // Add the edges mesh to the scene
        scene.add(edgesMesh);
    });
    */

    //GLTFLoader
    // gltfloader.load(
    //     './models/gltf/0606_solid.gltf',
    //     function (gltf) {
    //     scene.add(gltf.scene);
    //     gltf.scene.scale.multiplyScalar(0.1);
    //     gltf.scene.position.set(0.5, -0.5, 0.5);
    //     },
    //     undefined,
    //     function (error) {
    //     console.error('An error happened', error);
    //     }
    // );

    // gltfloader.load(
    //     './models/gltf/image.gltf',
    //     function (gltf) {
    //     gltf.scene.scale.multiplyScalar(0.1);
    //     gltf.scene.position.set(0.5, -0.5, 0.5);
    //     scene.add(gltf.scene);
    //     },
    //     undefined,
    //     function (error) {
    //     console.error('An error happened', error);
    //     }
    // );

    gltfloader.load(
        './models/scene/scene01.gltf',
        function (gltf) {
        gltf.scene.scale.multiplyScalar(0.1);
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

    /*
    gltfloader.load(
        './models/gltf/skull/scene.gltf',
        function (gltf) {
        gltf.scene.scale.multiplyScalar(0.3);
        gltf.scene.position.set(0.5, -0.5, 0.5);
        scene.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );

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
        map: videoTexture
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
    // loadTextures();
    loadVideo(scene1, './models/video/output.mp4', 1, 17, -16.5, 7.5, 9,0.9);
    loadVideo(scene1, './models/video/output.mp4', 1, 17, -5.5, 7.5, 9,0.9);
    loadVideo(scene1, './models/video/output.mp4', 1, 17, 5.5, 7.5, 9,0.9);
    loadVideo(scene1, './models/video/output.mp4', 1, 17, 17, 7.5, 9,0.9);
    scene1.add(camera1);
    handleResize();
    animateScene1(performance.now());
}

init();