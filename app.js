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
  return { x, z: -y };
}

AFRAME.registerComponent('place-fixed-model', {
  init: function () {
    const scene = this.el.sceneEl;

    window.addEventListener('gps-camera-update-position', (e) => {
      if (placed) return;

      const userLat = e.detail.position.latitude;
      const userLon = e.detail.position.longitude;
      const accuracy = e.detail.position.accuracy;

      if (accuracy > 15) {
        console.log(`[GPS] Недостаточная точность: ${accuracy}м`);
        return;
      }

      console.log('[GPS] Получена позиция:', userLat, userLon);

      // Получаем локальные метры от пользователя до лавочки
      const offset = gpsToMeters(userLat, userLon, benchLat, benchLon);

      // Поворачиваем на 90 градусов от лавочки
      const angleRad = 90 * Math.PI / 180;
      const x = offset.x + 15 * Math.cos(angleRad);
      const z = offset.z + 15 * Math.sin(angleRad);

      // Создание модели
      const entity = document.createElement('a-entity');
      entity.setAttribute('gltf-model', modelURL);
      entity.setAttribute('position', `${x} 0 ${z}`);
      entity.setAttribute('scale', '1 1 1');
      entity.setAttribute('rotation', '0 0 0');
      // entity.setAttribute('look-at', '[camera]'); // можно включить, если не глючит

      entity.addEventListener('model-loaded', () => {
        console.log('[✔] Модель загружена');
      });

      entity.addEventListener('model-error', (e) => {
        console.error('[✖] Ошибка загрузки модели:', e.detail);
      });

      // ⏳ Подождать, чтобы камера точно прогрузилась
      setTimeout(() => {
        scene.appendChild(entity);
      }, 500);

      placed = true;
    });
  }
});

document.querySelector('a-scene').setAttribute('place-fixed-model', '');
