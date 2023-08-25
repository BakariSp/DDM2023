import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js';
import { RectAreaLightUniformsLib } from './RectAreaLightUniformsLib.js';
import TWEEN from '@tweenjs/tween.js';
import {
	InstancedMesh, BoxGeometry, MeshPhongMaterial, Matrix4, Vector3, HemisphereLight
} from 'https://unpkg.com/three@0.123.0/build/three.module.js'

RectAreaLightUniformsLib.init();

let camera1, cameraTarget1, scene1, renderer1, lastFrameTime = 0;
let annotations = {};
let controls;
let i=0;
let pointLight = new THREE.PointLight(0xffffff);
let change=true;

const frameInterval = 1000 / 60;
const annotationMarkers = []
const targetObject = new THREE.Object3D();
const raycaster = new THREE.Raycaster()

//parameters for number circle
const numMeshes = [];
const numParticles = 20;
const centerPoint = new THREE.Vector3(0,0,0);
const rotationAxis = 'X'; // Change to 'X' or 'Y' as needed
const radius = 10;

//parameters for number wave
const numWavesMeshes = [];
const rotatePlane = 'XZ';
const beginPoint = new THREE.Vector3(0,0,0);

const boundingBox = new THREE.Vector3(30, 20, 30);
let numberClouds = [];

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
    loadModels();
    // addModel();
    loadNumbers();
    changeScene();
    scene1.add(camera1);
    handleResize();
    animateScene1(performance.now());
    animate();
}

function animate() {
    requestAnimationFrame(animate); 
    renderer1.render(scene1, camera1);
    controls.update();
    TWEEN.update();
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
    renderer1.setClearColor(0xc5cbd4, 1);
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
    camera1.position.set( 3, 0.15, 3 );
    cameraTarget1 = new THREE.Vector3( 0, 0, 0 );
    scene1 = new THREE.Scene();
    // scene1.fog = new THREE.Fog( 0xcccccc, 10, 15 );
    // scene1.fog = new THREE.Fog( 0xffffff, 20, 100 );
    // ... add lights and other scene objects ...
}

function setupLights() {
    const light = new THREE.AmbientLight( 0x404040, 1.2 ); // soft white light
    scene1.add( light );

    const Hemilight = new THREE.HemisphereLight( 0xffffff, 0x080808, 0.9 );
    scene1.add( Hemilight );
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

function loadNumbers() {
    const fontLoader = new FontLoader();

    fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function (font) {

        // Create an array to store geometries for numbers 1-9
        const numberGeometries = [];
        const positions = new Float32Array( numParticles * 3 );

        let count = 0;

        //define numbers from 0 to 9
        for (let i = 0; i < numParticles; i++) {
            const shapes = font.generateShapes((i % 9).toString(), 0.5);
            const geometry = new THREE.ShapeGeometry(shapes);
            numberGeometries.push(geometry);

            let theta = (Math.PI * 2 / numParticles) * i;

            //path of numbers set in a circle, which aligned with the YZ, XZ, XY Plane 
            if (rotationAxis === 'X') {
                positions[count] = centerPoint.x;
                positions[count + 1] = centerPoint.y  + radius * Math.cos(theta);
                positions[count + 2] = centerPoint.z + radius * Math.sin(theta);
            } else if (rotationAxis === 'Y') {
                positions[count] = centerPoint.x + radius * Math.cos(theta);
                positions[count + 1] = centerPoint.y ;
                positions[count + 2] = centerPoint.z + radius * Math.sin(theta);
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
            const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
          
            // Set the position
            mesh.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          
            // Add to the group
            group.add(mesh);
            numMeshes.push(mesh);
        }

        
        // Add the group to the scene
        scene1.add(group);
    } );

    for (let i = 0; i < numParticles; i++) {
        let cloudCenter = new THREE.Vector3( 
        (Math.random() - 0.5) * boundingBox.x, 
        (Math.random()) * boundingBox.y, 
        (Math.random() - 0.5) * boundingBox.z);
        numberClouds.push( new NumberCloud(scene1, 3, cloudCenter) );
    }
    
}

function updatePositions( numberMeshes ) {
    if( numberMeshes.length > 0 ) {
        for (let i = 0; i < numParticles; i++) {
        // Calculate new positions, for example:
        const theta = (Math.PI * 2 / numParticles) * i + Date.now() * 0.0004;
        let x, y, z = 0;
        let noise = 0;

        //update the position by time
        if (rotationAxis === 'X') {
            x = centerPoint.x ;
            y = centerPoint.y + noise + radius * Math.cos(theta) + noise;
            z = centerPoint.z + radius * Math.sin(theta) + noise;
        } else if (rotationAxis === 'Y') {
            x = centerPoint.x + radius * Math.cos(theta) ;
            y = centerPoint.y ;
            z = centerPoint.z + radius * Math.sin(theta) + noise;
        } else if (rotationAxis === 'Z') {
            x = centerPoint.x + radius * Math.cos(theta);
            y = centerPoint.y + radius * Math.sin(theta);
            z = centerPoint.z + noise;
        }
    
        // Update the mesh position
        numberMeshes[i].position.set(x, y, z);

        //make the numbers face directly to the camera
        numberMeshes[i].lookAt(camera1.position);
        // numMeshes[i].rotation.z += Math.PI / 2;
        }
    }else{
        console.log("updating value");
    }

    if (numberClouds.length > 0) {
        numberClouds.forEach(function (number) {
            number.update();
        });
    }
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
                        // child.material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
                        child.material = new THREE.LineDashedMaterial( {
                            color: 0xffffff,
                            linewidth: 1,
                            scale: 1,
                            dashSize: 3,
                            gapSize: 1,
                        } );
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


/*
function loadModels() {
    const loader = new PLYLoader();
    const gltfloader = new GLTFLoader();

    
    gltfloader.load(
        './models/scene/ss3/s3.gltf',
        function (gltf) {
        gltf.scene.scale.multiplyScalar(0.5);
        gltf.scene.position.set(0.5, -0.5, 0.5);
        scene1.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );
}*/

function loadModels() {
    const loader = new PLYLoader();
    const gltfloader = new GLTFLoader();

    gltfloader.load(
        './models/scene/ss3/s3.gltf',
        function (gltf) {
            let scale = 0.5;
            // gltf.scene.scale.multiplyScalar(0.1
            gltf.scene.scale.set(scale, scale, scale);
            gltf.scene.position.set(0.5, -0.5, 0.5);

            /*
            gltf.scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    // Convert mesh to edge geometry
                    const edges = new THREE.EdgesGeometry(child.geometry);

                    // Set the material of the mesh to LineDashedMaterial
                    const dashedMaterial = new THREE.LineDashedMaterial({
                        color: 0xffffff,
                        linewidth: 1,
                        scale: 1,
                        dashSize: 1,
                        gapSize: 1,
                    });

                    const line = new THREE.LineSegments(edges, dashedMaterial);
                    line.computeLineDistances();

                    scene1.add(line);
                }
            });*/

            scene1.add(gltf.scene);
        },
        undefined,
        function (error) {
            console.error('An error happened', error);
        }
    );


    gltfloader.load(
        './models/gltf/Sign.gltf',
        function (gltf) {
            let scale = 0.5;
            //scale of models
            gltf.scene.scale.set(scale, scale, scale);
            gltf.scene.position.set(0.5, -0.5, 0.5);

            
            gltf.scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    // Convert mesh to edge geometry
                    const edges = new THREE.EdgesGeometry(child.geometry);

                    // Set the material of the mesh to LineDashedMaterial
                    const dashedMaterial = new THREE.LineDashedMaterial({
                        color: 0xffffff,
                        linewidth: 1,
                        scale: 1,
                        dashSize: 1,
                        gapSize: 1,
                    });

                    const line = new THREE.LineSegments(edges, dashedMaterial);
                    line.computeLineDistances();

                    scene1.add(line);
                }
            });

            scene1.add(gltf.scene);
        },
        undefined,
        function (error) {
            console.error('An error happened', error);
        }
    );
}

function addModel() {
	fetch("/src/json/instances.json").then(r => r.json()).then(instanceData => {
		let geometry = new BoxGeometry(0.1, 0.1, 0.1)
		let material = new MeshPhongMaterial()
		let mesh = new InstancedMesh(geometry, material, instanceData.length)
		
		let matrix = new Matrix4() // init matrix to assign transforms from
		for (let i = 0; i < instanceData.length; i++) {
			let inst = instanceData[i]
			let pos = new Vector3(inst["tx"], inst["ty"], inst["tz"])
			matrix.setPosition(pos)
			mesh.setMatrixAt(i, matrix)
		}

		scene1.add(mesh)
		camera1.position.z = 5
	})   
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
                console.log('change:', change);
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
    console.log('change:', change);
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
    // beginPoint loading data
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
    updatePositions( numMeshes, numWavesMeshes );
    
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

class NumberCloud {
    constructor(scene, boundingBoxSize, centerPoint) {
      this.scene = scene;
      this.center = centerPoint;
      this.boundingBoxSize = boundingBoxSize;
      this.numbers = [];
      this.velocities = [];
      this.createNumbers();
      this.boundary = 20;

      this.centerVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
    }
  
    createNumbers() {
      const loader = new FontLoader();
  
      loader.load('fonts/helvetiker_regular.typeface.json', font => {
        for (let i = 0; i < 10; i++) {
          const randomNumber = font.generateShapes(i.toString(), 0.2);
          const geometry = new THREE.ShapeGeometry(randomNumber);
  
          const material = new THREE.MeshBasicMaterial({ color: 0xffffff,  side: THREE.DoubleSide });
          const numberMesh = new THREE.Mesh(geometry, material);
  
          numberMesh.position.set(
            this.center.x + THREE.MathUtils.randFloatSpread(this.boundingBoxSize),
            this.center.y + THREE.MathUtils.randFloatSpread(this.boundingBoxSize),
            this.center.z + THREE.MathUtils.randFloatSpread(this.boundingBoxSize)
          );
  
          this.velocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
          ));
  
          this.numbers.push(numberMesh);
          this.scene.add(numberMesh);
        }
      });
    }
  


    /*
    update() {
        const safeDistance = this.boundingBoxSize * 0.5;
        // Update center position
        this.center.add(this.centerVelocity);

        // If the center moves outside a certain boundary, reverse its direction
        
        if (Math.abs(this.center.x) > this.boundary) {
            this.centerVelocity.x *= -1;
        }
        if (Math.abs(this.center.y) > this.boundary) {
            this.centerVelocity.y *= -1;
        }
        if (Math.abs(this.center.z) > this.boundary) {
            this.centerVelocity.z *= -1;
        }

        // Update numbers position
        
        for (let i = 0; i < this.numbers.length; i++) {
            /*
            this.numbers[i].position.add(this.velocities[i]);
            const position = this.numbers[i].position;

            if (Math.abs(position.x - this.center.x) > this.boundingBoxSize / 2){
                this.velocities[i].x *= -1;
            }
            if (Math.abs(position.y - this.center.y) > this.boundingBoxSize / 2){
                this.velocities[i].y *= -1;
            }
            if (Math.abs(position.z - this.center.z) > this.boundingBoxSize / 2){
                this.velocities[i].z *= -1;
            }
            const position = this.numbers[i].position;
            const distanceToCenter = position.distanceTo(this.center);
            const isOutsideX = Math.abs(position.x - this.center.x) > this.boundingBoxSize / 2;
            const isOutsideY = Math.abs(position.y - this.center.y) > this.boundingBoxSize / 2;
            const isOutsideZ = Math.abs(position.z - this.center.z) > this.boundingBoxSize / 2;
            if (distanceToCenter < safeDistance) {
                // If too close to the center, push the number away
                this.velocities[i].subVectors(position, this.center).normalize().multiplyScalar(0.2);
            }else{
                if (isOutsideX || isOutsideY || isOutsideZ) {
                    // Set the velocity to point towards the center
                    this.velocities[i].subVectors(this.center, position).normalize().multiplyScalar(0.05);
                }
            }
            
            this.numbers[i].position.add(this.velocities[i]);
            this.numbers[i].lookAt(camera1.position);
        }

        if (this.numbers.length > 0) {
            // console.log(this.numbers[0].position, this.center);
        }   
    }*/

    update() {
        // Update center position
        this.center.add(this.centerVelocity);

        // If the center moves outside a certain boundary, reverse its direction
        const boundary = 20;  // You can adjust this as needed
        if (Math.abs(this.center.x) > boundary / 2){
            this.centerVelocity.x *= -1;
        }
        if (this.center.y > boundary || this.center.y < 0){
            this.centerVelocity.y *= -1;
        }
        if (Math.abs(this.center.z) > boundary / 2){
            this.centerVelocity.z *= -1;
        }

        const safeDistance = this.boundingBoxSize * 0.2;

        // Update numbers position based on innerVelocities
        for (let i = 0; i < this.numbers.length; i++) {
            const position = this.numbers[i].position;
            const distanceToCenter = position.distanceTo(this.center);

            if (distanceToCenter < safeDistance) {
                // Push the number away from the center
                this.velocities[i].subVectors(position, this.center).normalize().multiplyScalar(0.02);
            } else {
                const isOutsideX = Math.abs(position.x - this.center.x) > this.boundingBoxSize / 2;
                const isOutsideY = Math.abs(position.y - this.center.y) > this.boundingBoxSize / 2;
                const isOutsideZ = Math.abs(position.z - this.center.z) > this.boundingBoxSize / 2;
                
                if (isOutsideX || isOutsideY || isOutsideZ) {
                    // Move the number towards the center
                    this.velocities[i].subVectors(this.center, position).normalize().multiplyScalar(0.02);
                }
            }

            // Adjust position based on inner velocity
            this.numbers[i].position.add(this.velocities[i]);

            // Adjust position based on overall velocity (center's movement)
            this.numbers[i].position.add(this.centerVelocity);
            this.numbers[i].lookAt(camera1.position);
        }
    }
  }


init();


  