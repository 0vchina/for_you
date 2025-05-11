// Координаты лавочки
const benchLat = 52.1534551;  // замените на свои координаты
const benchLon = 26.1956841;
const modelURL = 'https://0vchina.github.io/for_you/model.glb';  // Убедитесь, что файл реально по этому пути

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

AFRAME.registerComponent('load-model', {
  init: function () {
    const sceneEl = this.el.sceneEl;

    console.log('[INFO] Ждём GPS-позицию...');

    window.addEventListener('gps-camera-update-position', (e) => {
      const position = e.detail.position;
      console.log('[GPS] Позиция получена:', position);

      if (document.querySelector('#target-model')) {
        console.warn('[WARN] Модель уже добавлена.');
        return;
      }

      const target = destinationPoint(benchLat, benchLon, 15, 90);
      console.log('[INFO] Расчёт координат модели:', target);

      const entity = document.createElement('a-entity');
      entity.setAttribute('id', 'target-model');
      entity.setAttribute('gps-entity-place', `latitude: ${target.latitude}; longitude: ${target.longitude}`);
      entity.setAttribute('gltf-model', modelURL);
      entity.setAttribute('scale', '1 1 1');
      entity.setAttribute('rotation', '0 0 0');
      entity.setAttribute('look-at', '[gps-camera]');

      entity.addEventListener('model-loaded', () => {
        console.log('[SUCCESS] Модель загружена.');
      });

      entity.addEventListener('model-error', (err) => {
        console.error('[ERROR] Ошибка загрузки модели:', err);
      });

      sceneEl.appendChild(entity);
    });
  }
});

document.querySelector('a-scene').setAttribute('load-model', '');
