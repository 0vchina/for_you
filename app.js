// Координаты лавочки
const benchLat = 52.1534551;  // замените на свои координаты
const benchLon = 26.1956841;
const modelURL = 'https://0vchina.github.io/for_you/model.glb';

let placed = false;

function gpsToMeters(lat1, lon1, lat2, lon2) {
  const R = 6378137;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const x = dLon * R * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
  const y = dLat * R;
  return { x, z: -y }; // -y → чтобы модель стояла "вперёд"
}

AFRAME.registerComponent('fix-gps-model', {
  init: function () {
    const sceneEl = this.el.sceneEl;

    window.addEventListener('gps-camera-update-position', (e) => {
      if (placed) return;

      const userLat = e.detail.position.latitude;
      const userLon = e.detail.position.longitude;
      const accuracy = e.detail.position.accuracy;

      if (accuracy > 15) {
        console.log(`[GPS] Точность ${accuracy}м — недостаточно`);
        return;
      }

      console.log('[GPS] Позиция получена. Создаём модель');

      const offset = gpsToMeters(userLat, userLon, benchLat, benchLon);
      const angleRad = 90 * (Math.PI / 180);
      const distance = 15;

      const x = offset.x + distance * Math.cos(angleRad);
      const z = offset.z + distance * Math.sin(angleRad);

      const entity = document.createElement('a-entity');
      entity.setAttribute('gltf-model', modelURL);
      entity.setAttribute('position', `${x} 0 ${z}`);
      entity.setAttribute('scale', '1 1 1');
      entity.setAttribute('look-at', '[camera]');
      entity.setAttribute('rotation', '0 0 0');

      entity.addEventListener('model-loaded', () => {
        console.log('[SUCCESS] Модель загружена.');
      });

      sceneEl.appendChild(entity);
      placed = true;
    });
  }
});

document.querySelector('a-scene').setAttribute('fix-gps-model', '');
