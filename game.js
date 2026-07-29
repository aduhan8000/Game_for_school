import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/////////////////////////
// Lights
/////////////////////////

const sun = new THREE.DirectionalLight(0xffffff, 2);

sun.position.set(80, 100, 50);
sun.castShadow = true;

scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff, .4));

/////////////////////////
// Ground
/////////////////////////

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({
        color: 0x4e8b2a
    })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/////////////////////////
// Track
/////////////////////////

const trackShape = new THREE.Shape();

trackShape.absellipse(0, 0, 80, 50, 0, Math.PI * 2);

const hole = new THREE.Path();
hole.absellipse(0, 0, 50, 20, 0, Math.PI * 2);

trackShape.holes.push(hole);

const trackGeometry = new THREE.ShapeGeometry(trackShape);

const track = new THREE.Mesh(
    trackGeometry,
    new THREE.MeshStandardMaterial({
        color: 0x333333
    })
);

track.rotation.x = -Math.PI / 2;
track.position.y = .02;
track.receiveShadow = true;

scene.add(track);

/////////////////////////
// Trees
/////////////////////////

for (let i = 0; i < 120; i++) {

    const angle = Math.random() * Math.PI * 2;
    const radius = 100 + Math.random() * 80;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(.5, .5, 3),
        new THREE.MeshStandardMaterial({ color: 0x6b4423 })
    );

    trunk.position.set(x, 1.5, z);

    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2.5, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x228822 })
    );

    leaves.position.set(x, 5, z);

    trunk.castShadow = true;
    leaves.castShadow = true;

    scene.add(trunk);
    scene.add(leaves);

}

/////////////////////////
// Car
/////////////////////////

const car = new THREE.Group();

const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 4),
    new THREE.MeshStandardMaterial({ color: 0xff3333 })
);

body.position.y = 1;

body.castShadow = true;

car.add(body);

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, .8, 2),
    new THREE.MeshStandardMaterial({ color: 0x99ccff })
);

cabin.position.set(0, 1.8, -.2);

car.add(cabin);

scene.add(car);

car.position.set(0, 0, 35);

/////////////////////////
// Controls
/////////////////////////

const keys = {};

window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);

window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

let speed = 0;
let heading = 0;

/////////////////////////
// Camera Follow
/////////////////////////

const cameraOffset = new THREE.Vector3(0, 6, -12);

/////////////////////////
// Update
/////////////////////////

function update() {

    if (keys["w"] || keys["arrowup"])
        speed -= 0.01;

    if (keys["s"] || keys["arrowdown"])
        speed += 0.02;

    speed *= 0.985;

    speed = Math.max(-0.4, Math.min(.8, speed));

    if (Math.abs(speed) > 0.01) {

        if (keys["a"] || keys["arrowleft"])
            heading -= 0.04 * (speed > 0 ? 1 : -1);

        if (keys["d"] || keys["arrowright"])
            heading += 0.04 * (speed > 0 ? 1 : -1);

    }

    car.rotation.y = heading;

    car.position.x -= Math.sin(heading) * speed;
    car.position.z -= Math.cos(heading) * speed;

    const offset = cameraOffset.clone();
    offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        heading
    );

    camera.position.copy(car.position).add(offset);

    camera.lookAt(
        car.position.x,
        car.position.y + 2,
        car.position.z
    );

}

/////////////////////////
// Animate
/////////////////////////

function animate() {

    requestAnimationFrame(animate);

    update();

    renderer.render(scene, camera);

}

animate();

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

});