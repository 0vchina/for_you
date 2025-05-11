const targetCoords = { lat: 52.153500, lon: 26.195100 }; // Задай свои координаты
const activationRadius = 100; // в метрах

document.getElementById('start').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("Геолокация не поддерживается");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const userLat = pos.coords.latitude;
    const userLon = pos.coords.longitude;
    const distance = getDistanceMeters(userLat, userLon, targetCoords.lat, targetCoords.lon);

    if (distance <= activationRadius) {
      document.getElementById('start').remove();
      initAR();
    } else {
      alert(`Вы слишком далеко (${distance.toFixed(1)} м)`);
    }
  }, err => {
    alert("Ошибка GPS: " + err.message);
  }, { enableHighAccuracy: true });
});

function initAR() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  document.body.appendChild(THREE.ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  const loader = new THREE.GLTFLoader();
  loader.load('model/your_model.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, -5);
    scene.add(model);
  }, undefined, err => {
    console.error("Ошибка загрузки модели:", err);
  });

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
