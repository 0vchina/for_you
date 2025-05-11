// Координаты лавочки
const benchLat = 52.1534551;  // замените на свои координаты
const benchLon = 26.1956841;
const modelURL = 'model.glb'; // или ссылка на CDN

// Вспомогательная функция для расчёта точки на расстоянии и угле
function toRadians(deg) {
  return deg * Math.PI / 180;
}

function destinationPoint(lat, lon, distance, bearing) {
  const R = 6371000; // Радиус Земли в метрах
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

// Проверка и логика
AFRAME.registerComponent('load-model', {
  init: function () {
    const sceneEl = this.el.sceneEl;

    console.log('[INFO] Ожидание GPS-позиции...');

    window.addEventListener('gps-camera-update-position', (e) => {
      const position = e.detail.position;
      console.log('[GPS] Позиция получена:', position);

      // Очищаем, если модель уже добавлена
      if (document.querySelector('#target-model')) {
        console.warn('[WARN] Модель уже добавлена.');
        return;
      }

      // Вычисляем позицию на 15 м от лавочки под углом 90°
      const targetCoords = destinationPoint(benchLat, benchLon, 15, 90);
      console.log('[CALC] Координаты модели:', targetCoords);

      // Создание модели
      const entity = document.createElement('a-entity');
      entity.setAttribute('id', 'target-model');
      entity.setAttribute('gps-entity-place', `latitude: ${targetCoords.latitude}; longitude: ${targetCoords.longitude}`);
      entity.setAttribute('gltf-model', modelURL);
      entity.setAttribute('scale', '1 1 1');
      entity.setAttribute('rotation', '0 0 0');
      entity.setAttribute('look-at', '[gps-camera]');

      // Отладка ошибок загрузки
      entity.addEventListener('model-error', (err) => {
        console.error('[ERROR] Ошибка загрузки модели:', err);
      });

      entity.addEventListener('model-loaded', () => {
        console.log('[SUCCESS] Модель загружена и размещена.');
      });

      sceneEl.appendChild(entity);
    });
  }
});

document.querySelector('a-scene').setAttribute('load-model', '');
