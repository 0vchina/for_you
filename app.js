// Координаты лавочки
const benchLat = 52.1534551;  // замените на свои координаты
const benchLon = 26.1956841;
const modelURL = 'https://0vchina.github.io/for_you/model.glb';
let modelEntity = null;
let placed = false;

function toRadians(deg) {
  return deg * Math.PI / 180;
}

function destinationPoint(lat, lon, distance, bearing) {
  const R = 6371000;
  const δ = distance / R;
  const θ = toRadians(bearing);
  const φ1 = toRadians(lat);
  const λ1 = toRadians(lon);

  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) +
      Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
                             Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

  return {
    latitude: φ2 * 180 / Math.PI,
    longitude: λ2 * 180 / Math.PI
  };
}

AFRAME.registerComponent('load-model-stable', {
  init: function () {
    const scene = this.el.sceneEl;
    let lastAccuracy = Infinity;
    let lastPosition = null;

    window.addEventListener('gps-camera-update-position', (e) => {
      const { latitude, longitude, accuracy } = e.detail.position;

      if (accuracy > 15) {
        console.log(`[GPS] Точность ${accuracy}м — слишком низкая`);
        return;
      }

      if (placed) return;

      console.log(`[GPS] Принятая точка с точностью ${accuracy}м`);

      const modelCoords = destinationPoint(benchLat, benchLon, 15, 90);
      modelEntity = document.createElement('a-entity');
      modelEntity.setAttribute('id', 'target-model');
      modelEntity.setAttribute('gps-entity-place', `latitude: ${modelCoords.latitude}; longitude: ${modelCoords.longitude}`);
      modelEntity.setAttribute('gltf-model', modelURL);
      modelEntity.setAttribute('scale', '1 1 1');
      modelEntity.setAttribute('look-at', '[gps-camera]');
      modelEntity.setAttribute('rotation', '0 0 0');

      modelEntity.addEventListener('model-loaded', () => {
        console.log('[SUCCESS] Модель загружена и размещена.');
      });

      modelEntity.addEventListener('model-error', (err) => {
        console.error('[ERROR] Ошибка загрузки модели:', err);
      });

      scene.appendChild(modelEntity);
      placed = true;
    });
  }
});

document.querySelector('a-scene').setAttribute('load-model-stable', '');
