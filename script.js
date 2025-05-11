// Координаты лавочки
const benchLat = 52.1534551;  // замените на свои координаты
const benchLon = 26.1956841;
const modelURL = 'model.glb'; // путь к .glb (можно использовать GitHub CDN)

function toRadians(deg) {
  return deg * Math.PI / 180;
}

function destinationPoint(lat, lon, distance, bearing) {
  const R = 6371000; // радиус Земли в метрах
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
    const modelCoords = destinationPoint(benchLat, benchLon, 15, 90); // 90° от лавочки

    const entity = document.createElement('a-entity');
    entity.setAttribute('gps-entity-place', `latitude: ${modelCoords.latitude}; longitude: ${modelCoords.longitude};`);
    entity.setAttribute('gltf-model', modelURL);
    entity.setAttribute('scale', '1 1 1');
    entity.setAttribute('rotation', '0 0 0');
    entity.setAttribute('look-at', '[gps-camera]');

    sceneEl.appendChild(entity);
  }
});

document.querySelector('a-scene').setAttribute('load-model', '');
