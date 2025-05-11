import * as THREE from 'https://cdn.skypack.dev/three@0.150.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'https://cdn.skypack.dev/three/examples/jsm/webxr/ARButton.js';

const targetCoords = { lat: 52.153500, lon: 26.195100 }; // Задай свои координаты
const activationRadius = 100; // в метрах


document.getElementById('start').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;
      if (getDistanceMeters(userLat, userLon, targetCoords.lat, targetCoords.lon) <= activationRadius) {
        document.getElementById('start').remove();
        initAR();
      } else {
        alert("Вы не на нужной локации.");
      }
    },
    err => {
      alert("Ошибка GPS: " + err.message);
    },
    { enableHighAccuracy: true }
  );
});

function initAR() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  const loader = new GLTFLoader();
  loader.load('model/your_model.glb', gltf => {
    const model = gltf.scene;
    model.position.set(0, 0, -5); // 5 м вперёд
    scene.add(model);
  });

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
