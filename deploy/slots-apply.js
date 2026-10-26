// Пушит запечённое состояние слотов в <image-slot> — без fetch, чтобы фото
// работали и в опубликованной (офлайн) версии. Файлы slots-data-*.js в сборке
// могут выполняться не по порядку, поэтому пушим повторно, пока набор растёт.
(function () {
  var last = -1;
  var stable = 0;
  var push = function () {
    var st = window.__imageSlotsState;
    if (!st || !window.__imageSlotsIngest) return false;
    window.__imageSlotsIngest(st);
    var n = Object.keys(st).length;
    if (n === last) stable++; else { stable = 0; last = n; }
    return stable > 6;
  };
  var n = 0;
  var t = setInterval(function () {
    if (push() || ++n > 80) clearInterval(t);
  }, 120);
  window.addEventListener('load', push);
})();
