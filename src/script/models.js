import * as THREE from 'three';

import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('three-container');
// Set the position and size of the canvas element.
// Add CSS styles
document.body.style.margin = '0';
document.body.style.overflow = 'scroll';
canvas.style.position = 'absolute';
canvas.style.top = '50%';
canvas.style.left = '50%';
canvas.style.transform = 'translate(-50%, -50%)';
canvas.style.overflow = 'hidden';

let camera, cameraTarget, scene;
const width = window.innerWidth/2;
const height = window.innerHeight/2;
var renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(width, height);
renderer.setClearColor(0xffffff, 1);

let lastFrameTime = 0;
const frameInterval = 1000 / 60; 

init();
// animate();

var orbit = new THREE.Object3D();
orbit.add(camera);

// Add the orbit to the scene
scene.add(orbit);


let controls = new OrbitControls(camera, renderer.domElement);

// Swap orbit and pan
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
  };


function op_change(mesh){
    var scrollPos = window.scrollY;
    mesh.emissiveIntensity  = scrollPos%1000 / 1000;
}


function init() {
    camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
    camera.position.set( 3, 0.15, 3 );
    cameraTarget = new THREE.Vector3( 0, 0, 0 );
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x72645b, 2, 15 );
    

    const color = 0x000000;
    const intensity = 0.1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // PLY file
    const loader = new PLYLoader();
    const gltfloader = new GLTFLoader();

    // Load your GLTF file
    /*
    gltfloader.load(
        './models/gltf/scene_2.gltf',
        function (gltf) {
        // The loaded object is a group (or a scene) that contains all the models
        // gltf.scene.traverse(function (child) {
        //     console.log(child);
        //     // This is a line. You can apply your line material here.
        //     const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        //     child.material = lineMaterial;
        // });
        // // Add the loaded object to your scene
        scene.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );*/

    /*
    gltfloader.load(
        './models/gltf/skull/scene.gltf',
        
        function (gltf) {
          // The loaded object is a group (or a scene) that contains all the models
          gltf.scene.position.set(0, 0, 0); // Adjust position as needed
          gltf.scene.rotation.set(0, 0, 0); // Adjust rotation as needed

          gltf.scene.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              // This is a mesh. You can apply your material here.
              const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
              child.material = material;
            }
          });
          // Add the loaded object to your scene
          scene.add(gltf.scene);
        },
        undefined,
        function (error) {
          console.error('An error happened', error);
        }
    );*/

   
    loader.load('./models/ply/ascii/curve.ply', function (geometry) {
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
    });*/
    gltfloader.load(
        './models/img/image.gltf',
        function (gltf) {
        // The loaded object is a group (or a scene) that contains all the models
        // gltf.scene.traverse(function (child) {
        //     console.log(child);
        //     // This is a line. You can apply your line material here.
        //     const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        //     child.material = lineMaterial;
        // });
        // // Add the loaded object to your scene
        scene.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );

    gltfloader.load(
        './models/gltf/sample_1.gltf',
        function (gltf) {
        // The loaded object is a group (or a scene) that contains all the models
        // gltf.scene.traverse(function (child) {
        //     console.log(child);
        //     // This is a line. You can apply your line material here.
        //     const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        //     child.material = lineMaterial;
        // });
        // // Add the loaded object to your scene
        scene.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );


    gltfloader.load(
        './models/gltf/sample_2.gltf',
        function (gltf) {
        // The loaded object is a group (or a scene) that contains all the models
        // gltf.scene.traverse(function (child) {
        //     console.log(child);
        //     // This is a line. You can apply your line material here.
        //     const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        //     child.material = lineMaterial;
        // });
        // // Add the loaded object to your scene
        scene.add(gltf.scene);
        },
        undefined,
        function (error) {
        console.error('An error happened', error);
        }
    );


    //render
    
    loader.load( './models/ply/ascii/test.ply', function ( geometry ) {

        geometry.computeVertexNormals();

        const material = new THREE.PointsMaterial( { size: 0.01 } );
        
        const mesh = new THREE.Points( geometry, material );
        // console.log( mesh );
        
        mesh.rotation.x = -Math.PI / 2;
        mesh.scale.multiplyScalar( 0.1 );
        // mesh.visible = false;
        window.addEventListener('scroll', (event) => {
            vis_switch( mesh, 0, 1000);

        });
        document.getElementById('button_1').addEventListener('click', () => {
            mesh.visible = !mesh.visible;
        });
        
        scene.add( mesh );
    } );




    loader.load('./models/ply/ascii/bench.ply', function (geometry) {
        geometry.computeVertexNormals();
    
        
        window.addEventListener('scroll', (event) => {
            op_change(edgesMaterial);
        });
    
        
        // Create the EdgesGeometry for the model
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
        // Create a LineBasicMaterial for the edges with white color
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    
        // Create a LineSegments mesh using the edges geometry and material
        const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
        // Scale and rotate the edges mesh to match the original model
        edgesMesh.rotation.x = -Math.PI / 2;
        edgesMesh.scale.multiplyScalar(0.01);
    
        // Add the edges mesh to the scene
        scene.add(edgesMesh);
    });


    
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


    
  
    
    // resize
    scene.add(camera);
    window.addEventListener( 'resize', onWindowResize );  
}   



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}





function render(time) {
    // orbit.rotation.y += rotationSpeed;


    // Make the camera look at the target
    camera.lookAt(cameraTarget);
    const elapsedTime = time - lastFrameTime;
    
    if (elapsedTime >= frameInterval) {
        // Render scene with updated camera position
        renderer.render(scene, camera);

        // Update last frame time
        lastFrameTime = time;
    }

    // Request next animation frame
    requestAnimationFrame(render);
}



render(performance.now());








