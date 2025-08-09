# 🚀 LightModal v4.0

<div align="center">
  <p>
    <strong>Легковесная, современная и полнофункциональная библиотека модальных окон</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/version-4.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/size-~15kb-green.svg" alt="Size">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
    <img src="https://img.shields.io/badge/dependencies-0-orange.svg" alt="Dependencies">
  </p>
</div>

## ✨ Особенности

- 🎯 **Нулевые зависимости** - чистый JavaScript, никаких внешних библиотек
- 📱 **Полная адаптивность** - отлично работает на всех устройствах
- 🎨 **Темы** - поддержка светлой/тёмной темы с auto-detect
- 🖱️ **Drag-to-close** - закрытие свайпом/перетаскиванием в любом направлении
- 🖼️ **Универсальность** - изображения, видео, YouTube, Vimeo, iframe, inline-контент
- ♿ **Доступность** - полная поддержка клавиатуры, screen readers, ARIA
- 🎭 **Анимации** - плавные и настраиваемые эффекты
- 🔒 **Focus trap** - правильное управление фокусом
- 📸 **Галереи** - встроенная поддержка с навигацией
- 💤 **Idle режим** - автоскрытие элементов управления
- 🌐 **Dialog API** - использование нативного `<dialog>` где поддерживается

## 📦 Установка

### Вариант 1: Прямое подключение

```html
<!-- CSS -->
<link rel="stylesheet" href="lightmodal.css">

<!-- JavaScript -->
<script src="lightmodal.js"></script>
```

### Вариант 2: NPM (скоро)

```bash
npm install lightmodal
```

### Вариант 3: CDN (скоро)

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lightmodal@4/dist/lightmodal.min.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/lightmodal@4/dist/lightmodal.min.js"></script>
```

## 🚀 Быстрый старт

### Простое использование

```html
<!-- Изображение -->
<a href="image.jpg" data-lightmodal>Открыть изображение</a>

<!-- YouTube видео -->
<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" data-lightmodal>Смотреть видео</a>

<!-- Inline контент -->
<a href="#my-content" data-lightmodal>Показать контент</a>
<div id="my-content" class="inline-content">
  <h2>Заголовок</h2>
  <p>Ваш контент здесь...</p>
</div>
```

### JavaScript API

```javascript
// Простое открытие
LightModal.open('image.jpg');

// С опциями
LightModal.open('video.mp4', {
  theme: 'dark',
  dragToClose: true,
  idle: 5000
});

// Массив элементов (галерея)
LightModal.open([
  { src: 'img1.jpg', caption: 'Фото 1' },
  { src: 'img2.jpg', caption: 'Фото 2' },
  { src: 'img3.jpg', caption: 'Фото 3' }
], {
  startIndex: 0
});
```

## 📖 Подробная документация

### Инициализация через data-атрибуты

```html
<!-- Основные атрибуты -->
<a href="image.jpg" 
   data-lightmodal
   data-caption="Описание изображения"
   data-gallery="my-gallery"
   data-type="image">
  Открыть
</a>

<!-- С дополнительными опциями -->
<a href="video.mp4"
   data-lightmodal
   data-lm-theme="dark"
   data-lm-width="800"
   data-lm-height="600"
   data-lm-drag-to-close="true">
  Открыть видео
</a>
```

### Поддерживаемые data-атрибуты

| Атрибут | Описание | Значение по умолчанию |
|---------|----------|----------------------|
| `data-lightmodal` | Активирует LightModal | - |
| `data-src` | Альтернативный источник (вместо href) | - |
| `data-type` | Тип контента (image, video, iframe, ajax, inline) | auto |
| `data-caption` | Подпись | - |
| `data-gallery` | Имя галереи для группировки | - |
| `data-lm-theme` | Тема (dark, light, auto) | dark |
| `data-lm-width` | Ширина модального окна | auto |
| `data-lm-height` | Высота модального окна | auto |
| `data-lm-drag-to-close` | Закрытие перетаскиванием | true |
| `data-lm-close-on-backdrop` | Закрытие по клику на фон | true |
| `data-lm-close-on-esc` | Закрытие по Escape | true |
| `data-lm-idle` | Время до idle режима (мс) | 3000 |

### JavaScript API

#### Методы класса

```javascript
// Открыть модальное окно
const modal = LightModal.open(items, options);

// Закрыть текущее модальное окно
LightModal.close();

// Закрыть все модальные окна
LightModal.closeAll();

// Получить текущий экземпляр
const current = LightModal.getInstance();

// Получить экземпляр по ID
const modal = LightModal.getInstance('lm-1');
```

#### Методы экземпляра

```javascript
const modal = LightModal.open(['img1.jpg', 'img2.jpg', 'img3.jpg']);

// Навигация (для галерей)
modal.next();        // Следующий элемент
modal.prev();        // Предыдущий элемент
modal.goTo(2);       // Перейти к индексу

// События
modal.on('open', (instance) => {
  console.log('Модальное окно открыто');
});

modal.on('close', (instance) => {
  console.log('Модальное окно закрывается');
});

modal.off('open', handler); // Удалить обработчик

// Закрыть
modal.close();
```

### Опции

```javascript
const options = {
  // Основные
  mainClass: '',              // Дополнительный CSS класс
  theme: 'dark',              // 'dark' | 'light' | 'auto'
  startIndex: 0,              // Начальный индекс для галереи
  
  // Управление
  closeButton: true,          // Показывать кнопку закрытия
  closeOnBackdrop: true,      // Закрытие по клику на фон
  closeOnEsc: true,           // Закрытие по Escape
  closeExisting: false,       // Закрыть существующие модалки
  
  // Эффекты
  fadeEffect: true,           // Эффект затухания
  zoomEffect: true,           // Эффект масштабирования
  openSpeed: 366,             // Скорость открытия (мс)
  closeSpeed: 366,            // Скорость закрытия (мс)
  
  // Функциональность
  dragToClose: true,          // Закрытие перетаскиванием
  touch: true,                // Поддержка touch событий
  keyboard: true,             // Управление клавиатурой
  autoFocus: true,            // Автофокус на контенте
  restoreFocus: true,         // Восстановить фокус после закрытия
  hideScrollbar: true,        // Скрыть скроллбар body
  
  // Idle режим
  idle: 3000,                 // Время до idle режима (мс) или false
  
  // Размеры
  width: null,                // Ширина (число или строка с единицами)
  height: null,               // Высота (число или строка с единицами)
  
  // Шаблоны
  spinnerTpl: '<div class="lm-spinner"></div>',
  errorTpl: '<div class="lm-error">Ошибка загрузки</div>',
  closeBtnTpl: '<button class="lm-close-btn">×</button>',
  
  // Callbacks
  on: {
    init: (instance) => {},
    open: (instance) => {},
    close: (instance) => {},
    destroy: (instance) => {},
    contentReady: (instance, item) => {},
    change: (instance, index) => {}
  }
};

LightModal.open('content.html', options);
```

### События

```javascript
const modal = LightModal.open('image.jpg');

// Доступные события
modal.on('init', (instance) => {
  console.log('Инициализация');
});

modal.on('open', (instance) => {
  console.log('Открыто');
});

modal.on('contentReady', (instance, item) => {
  console.log('Контент загружен', item);
});

modal.on('change', (instance, index) => {
  console.log('Изменен слайд', index);
});

modal.on('close', (instance) => {
  console.log('Закрывается');
});

modal.on('destroy', (instance) => {
  console.log('Уничтожено');
});
```

## 🎨 Кастомизация

### CSS переменные

```css
:root {
  /* Backdrop */
  --lm-backdrop-bg: rgba(24, 24, 27, 0.95);
  --lm-backdrop-blur: 4px;
  
  /* Анимации */
  --lm-duration: 366ms;
  
  /* Цвета */
  --lm-bg: #fff;
  --lm-color: #222;
  --lm-border-color: rgba(0, 0, 0, 0.1);
  
  /* Кнопка закрытия */
  --lm-close-bg: rgba(255, 255, 255, 0.9);
  --lm-close-color: #444;
  --lm-close-size: 36px;
  
  /* Контент */
  --lm-border-radius: 12px;
  --lm-content-padding: 2rem;
  
  /* И многие другие... */
}
```

### Кастомные темы

```css
/* Создание своей темы */
[data-theme="custom"] {
  --lm-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --lm-color: #fff;
  --lm-close-bg: rgba(255, 255, 255, 0.2);
  --lm-close-color: #fff;
}
```

```javascript
// Использование кастомной темы
LightModal.open('content.html', {
  theme: 'custom'
});
```

## 🎮 Примеры использования

### Галерея изображений

```html
<div class="gallery">
  <a href="img1.jpg" data-lightmodal data-gallery="vacation" data-caption="Фото 1">
    <img src="thumb1.jpg" alt="Thumbnail 1">
  </a>
  <a href="img2.jpg" data-lightmodal data-gallery="vacation" data-caption="Фото 2">
    <img src="thumb2.jpg" alt="Thumbnail 2">
  </a>
  <a href="img3.jpg" data-lightmodal data-gallery="vacation" data-caption="Фото 3">
    <img src="thumb3.jpg" alt="Thumbnail 3">
  </a>
</div>
```

### Видео галерея

```javascript
const videos = [
  { 
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    caption: 'Rick Astley - Never Gonna Give You Up'
  },
  { 
    src: 'https://vimeo.com/347119375',
    caption: 'Beautiful Nature'
  },
  { 
    src: 'video.mp4',
    type: 'video',
    caption: 'Local Video'
  }
];

LightModal.open(videos, {
  theme: 'dark',
  startIndex: 0
});
```

### Формы и AJAX контент

```html
<!-- Форма обратной связи -->
<button onclick="openContactForm()">Связаться с нами</button>

<div id="contact-form" class="inline-content">
  <h2>Форма обратной связи</h2>
  <form>
    <input type="text" placeholder="Ваше имя" required>
    <input type="email" placeholder="Email" required>
    <textarea placeholder="Сообщение" required></textarea>
    <button type="submit">Отправить</button>
  </form>
</div>

<script>
function openContactForm() {
  const modal = LightModal.open('#contact-form', {
    width: 500,
    closeOnBackdrop: false,
    on: {
      open: () => {
        // Фокус на первом поле
        modal.content.querySelector('input').focus();
      }
    }
  });
}
</script>
```

### Подтверждение действий

```javascript
function confirmDelete(itemId) {
  const modal = LightModal.open({
    src: '#confirm-delete',
    type: 'inline'
  }, {
    width: 400,
    closeOnBackdrop: false,
    closeOnEsc: false,
    closeButton: false
  });
  
  // Обработчики кнопок
  modal.content.querySelector('.confirm').onclick = () => {
    deleteItem(itemId);
    modal.close();
  };
  
  modal.content.querySelector('.cancel').onclick = () => {
    modal.close();
  };
}
```

## 🎯 Продвинутые возможности

### Drag-to-close

Модальное окно можно закрыть, потянув его в любом направлении:

- **Вниз** - классическое закрытие свайпом вниз (мобильные устройства)
- **Влево/Вправо** - закрытие горизонтальным свайпом
- **Поддержка мыши** - работает и на десктопе с перетаскиванием мышью

```javascript
LightModal.open('image.jpg', {
  dragToClose: true  // Включено по умолчанию
});
```

### Idle режим

Автоматическое скрытие элементов управления при бездействии:

```javascript
LightModal.open('video.mp4', {
  idle: 5000  // Скрыть UI через 5 секунд
});
```

### Программное управление

```javascript
// Создаём экземпляр
const modal = LightModal.open(['img1.jpg', 'img2.jpg']);

// Управляем извне
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') modal.next();
  if (e.key === 'ArrowLeft') modal.prev();
  if (e.key === 'Home') modal.goTo(0);
  if (e.key === 'End') modal.goTo(modal.items.length - 1);
});

// Автопереключение слайдов
let autoplayInterval = setInterval(() => {
  if (modal.currentIndex < modal.items.length - 1) {
    modal.next();
  } else {
    modal.goTo(0); // Вернуться к началу
  }
}, 3000);

// Остановить при закрытии
modal.on('close', () => {
  clearInterval(autoplayInterval);
});