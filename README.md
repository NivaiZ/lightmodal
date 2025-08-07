# LightModal 3.x

Современная JavaScript библиотека для создания модальных окон с поддержкой нативного элемента `<dialog>`, вдохновленная Fancybox v6.

## ✨ Особенности

- 🔥 **Нативная поддержка `<dialog>`** с fallback на обычные div элементы
- 📱 **Touch-friendly** - swipe для закрытия на мобильных устройствах  
- 🎨 **Современный дизайн** с поддержкой темной темы
- 🚀 **Легковесная** - минимальные зависимости
- ♿ **Доступность** - полная поддержка ARIA и управления фокусом
- 🖼️ **Мультимедиа** - изображения, видео, YouTube, Vimeo, RuTube, VK
- 🔒 **Умная блокировка скролла** с компенсацией scrollbar
- 🎭 **Гибкая настройка** - множество опций и анимаций
- 📋 **Inline контент** - показ скрытых элементов страницы
- 🌐 **AJAX загрузка** - динамическая подгрузка контента

## 📦 Установка

### Подключение файлов

```html
<link rel="stylesheet" href="lightmodal.css">
<script src="lightmodal.js"></script>
```

### CDN (когда будет доступно)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lightmodal@3/dist/lightmodal.min.css">
<script src="https://cdn.jsdelivr.net/npm/lightmodal@3/dist/lightmodal.min.js"></script>
```

## 🚀 Быстрый старт

### HTML разметка

```html
<!-- Изображение -->
<a href="image.jpg" data-lightmodal data-caption="Описание изображения">
  <img src="thumb.jpg" alt="Миниатюра">
</a>

<!-- Inline контент -->
<a href="#modal-content" data-lightmodal data-caption="Заголовок модалки">
  Открыть модальное окно
</a>

<div id="modal-content" class="inline-content">
  <h2>Заголовок</h2>
  <p>Содержимое модального окна</p>
</div>

<!-- YouTube видео -->
<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" data-lightmodal>
  Открыть YouTube
</a>
```

### JavaScript API

```javascript
// Программное открытие
LightModal.open({
  src: '#my-content',
  type: 'inline',
  caption: 'Мой заголовок'
}, {
  mainClass: 'lm-zoom-in',
  backdrop: true
});

// Закрытие текущей модалки
LightModal.close();
```

## 📚 API Reference

### Статические методы

#### `LightModal.bind(selector)`

Автоматически привязывает обработчики к элементам.

```javascript
// По умолчанию привязывается к [data-lightmodal]
LightModal.bind();

// Кастомный селектор
LightModal.bind('.my-modal-trigger');
```

#### `LightModal.open(item, options)`

Программное открытие модального окна.

```javascript
LightModal.open({
  src: 'path/to/content',
  type: 'image', // image, video, iframe, inline, ajax
  caption: 'Описание',
  alt: 'Alt текст для изображений'
}, {
  width: 800,
  height: 600,
  backdrop: true
});
```

#### `LightModal.close()`

Закрывает текущее открытое модальное окно.

#### `LightModal.openFromTrigger(element)`

Открывает модалку на основе trigger элемента.

```javascript
const trigger = document.querySelector('.my-trigger');
LightModal.openFromTrigger(trigger);
```

### Конструктор

```javascript
const modal = new LightModal(item, options);
```

### Методы экземпляра

#### `modal.show()`
Показывает модальное окно.

#### `modal.close()`
Закрывает модальное окно.

#### `modal.focus()`
Устанавливает фокус на кнопку закрытия.

## ⚙️ Опции

### Основные настройки

```javascript
const defaults = {
  // Основные
  mainClass: '',              // Дополнительный CSS класс
  backdrop: true,             // Показывать backdrop
  backdropClick: true,        // Закрытие по клику на backdrop
  keyboard: true,             // Закрытие по Escape
  focus: true,                // Управление фокусом
  modal: true,                // Использовать <dialog> если доступен
  
  // Внешний вид
  compact: false,             // Компактный режим
  width: null,                // Ширина модалки
  height: null,               // Высота модалки
  minWidth: null,             // Минимальная ширина
  minHeight: null,            // Минимальная высота
  maxWidth: null,             // Максимальная ширина
  maxHeight: null,            // Максимальная высота
  
  // Поведение
  autoFocus: true,            // Автофокус на первый элемент
  restoreFocus: true,         // Восстановление фокуса
  dragToClose: true,          // Закрытие свайпом
  touch: true,                // Touch поддержка
  
  // Анимации
  openEffect: 'fade',         // fade, zoom-in, slide-up
  closeEffect: 'fade',        // Эффект закрытия
  openSpeed: 366,             // Скорость открытия (мс)
  closeSpeed: 366,            // Скорость закрытия (мс)
  
  // Элементы управления
  closeBtn: true,             // Показывать кнопку закрытия
  
  // AJAX настройки
  ajax: {
    dataType: 'html',
    headers: {}
  },
  
  // Iframe настройки
  iframe: {
    scrolling: 'auto',
    preload: true
  }
};
```

### Data-атрибуты

Опции можно задавать через data-атрибуты:

```html
<a href="image.jpg" 
   data-lightmodal
   data-lm-width="800"
   data-lm-height="600"
   data-lm-backdrop="false"
   data-lm-main-class="my-custom-class"
   data-caption="Мое изображение">
  Открыть изображение
</a>
```

## 🎭 Анимации

### Встроенные эффекты

```javascript
// Плавное появление (по умолчанию)
{ openEffect: 'fade' }

// Увеличение из центра
{ openEffect: 'zoom-in', mainClass: 'lm-zoom-in' }

// Выезд снизу
{ openEffect: 'slide-up', mainClass: 'lm-slide-up' }
```

### Кастомные анимации

```css
.my-custom-animation .lm-content-wrapper {
  transform: rotateX(-90deg);
  transform-origin: center top;
}

.my-custom-animation.is-open .lm-content-wrapper {
  transform: rotateX(0deg);
}
```

## 🖼️ Типы контента

### Изображения

```html
<a href="image.jpg" data-lightmodal data-type="image">
  <img src="thumb.jpg" alt="Thumbnail">
</a>
```

Поддерживаемые форматы: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`, `.svg`

### Видео

```html
<!-- Локальное видео -->
<a href="video.mp4" data-lightmodal data-type="video">Видео</a>

<!-- YouTube -->
<a href="https://www.youtube.com/watch?v=VIDEO_ID" data-lightmodal>YouTube</a>

<!-- Vimeo -->
<a href="https://vimeo.com/VIDEO_ID" data-lightmodal>Vimeo</a>

<!-- RuTube -->
<a href="https://rutube.ru/video/VIDEO_ID" data-lightmodal>RuTube</a>

<!-- VK -->
<a href="https://vk.com/video_ID" data-lightmodal>VK Видео</a>
```

### Inline контент

```html
<a href="#my-content" data-lightmodal data-type="inline">Открыть</a>

<div id="my-content" class="inline-content">
  <h2>Заголовок</h2>
  <p>Скрытый контент, который покажется в модалке</p>
</div>
```

### AJAX контент

```html
<a href="/api/content" data-lightmodal data-type="ajax">Загрузить</a>
```

```javascript
LightModal.open({
  src: '/api/modal-content',
  type: 'ajax'
}, {
  ajax: {
    headers: {
      'Authorization': 'Bearer token'
    }
  }
});
```

### Iframe

```html
<a href="https://example.com" data-lightmodal data-type="iframe">Сайт</a>
```

## 📱 Touch и мобильные устройства

### Swipe для закрытия

На touch устройствах доступен swipe вниз для закрытия:

```javascript
{
  dragToClose: true,    // Включить swipe
  touch: true          // Touch поддержка
}
```

### Мобильная оптимизация

```css
/* Автоматические стили для мобильных */
@media (max-width: 768px) {
  .lm-content-wrapper {
    border-radius: 12px 12px 0 0;
    max-height: 85vh;
  }
  
  .lm-container.is-mobile-bottom .lm-content-wrapper {
    margin-top: auto;
    margin-bottom: 0;
  }
}
```

## 🎨 Кастомизация стилей

### CSS переменные

```css
:root {
  --lm-backdrop-bg: rgba(24, 24, 27, 0.95);
  --lm-duration: 366ms;
  --lm-bg: #fff;
  --lm-border-radius: 12px;
  --lm-content-padding: 2rem;
  --lm-close-size: 36px;
  --lm-shadow-large: 0 24px 80px rgba(0, 0, 0, 0.25);
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
  :root {
    --lm-bg: #1a1a1a;
    --lm-close-color: #fff;
  }
}
```

### Кастомные классы

```css
.my-modal {
  --lm-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --lm-border-radius: 20px;
}

.my-modal .lm-content {
  color: white;
}
```

## ♿ Доступность

### ARIA атрибуты

Библиотека автоматически добавляет необходимые ARIA атрибуты:

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` / `aria-describedby`
- `aria-hidden`

### Управление фокусом

```javascript
{
  focus: true,           // Trap фокуса внутри модалки
  autoFocus: true,       // Автофокус на первый элемент
  restoreFocus: true     // Возврат фокуса после закрытия
}
```

### Клавиатурная навигация

- `Escape` - закрытие модалки
- `Tab` / `Shift+Tab` - навигация по элементам
- `Enter` / `Space` - активация кнопок

## 🔧 События

### Прослушивание событий

```javascript
// Открытие модалки
document.addEventListener('lightmodal:show', (e) => {
  console.log('Модалка открыта:', e.detail.instance);
});

// Закрытие модалки
document.addEventListener('lightmodal:close', (e) => {
  console.log('Модалка закрыта:', e.detail.instance);
});
```

### Кастомные обработчики

```javascript
const modal = new LightModal(item, options);

// Добавляем кастомную логику
modal.container.addEventListener('lightmodal:show', () => {
  // Действия при открытии
});
```

## 🔍 Расширенные примеры

### Галерея изображений

```html
<div class="gallery">
  <a href="img1.jpg" data-lightmodal data-gallery="nature" data-caption="Фото 1">
    <img src="thumb1.jpg" alt="Thumb 1">
  </a>
  <a href="img2.jpg" data-lightmodal data-gallery="nature" data-caption="Фото 2">
    <img src="thumb2.jpg" alt="Thumb 2">
  </a>
</div>
```

### Форма в модалке

```html
<a href="#contact-form" data-lightmodal data-lm-width="600">Связаться</a>

<div id="contact-form" class="inline-content">
  <h2>Обратная связь</h2>
  <form>
    <input type="text" placeholder="Имя" required>
    <textarea placeholder="Сообщение" required></textarea>
    <button type="submit">Отправить</button>
  </form>
</div>
```

### Программное управление

```javascript
class MyApp {
  constructor() {
    this.initModals();
  }
  
  initModals() {
    // Кастомный биндинг
    LightModal.bind('.open-modal');
    
    // Обработка событий
    document.addEventListener('lightmodal:show', this.onModalShow.bind(this));
  }
  
  openWelcomeModal() {
    LightModal.open({
      src: '#welcome-content',
      type: 'inline',
      caption: 'Добро пожаловать!'
    }, {
      backdrop: true,
      backdropClick: false, // Нельзя закрыть кликом
      keyboard: false,      // Нельзя закрыть Escape
      mainClass: 'welcome-modal'
    });
  }
  
  onModalShow(e) {
    console.log('Modal opened:', e.detail);
    
    // Отправляем аналитику
    gtag('event', 'modal_open', {
      modal_type: e.detail.item.type,
      modal_src: e.detail.item.src
    });
  }
}

const app = new MyApp();
```

## 🐛 Отладка

### Консольные сообщения

Библиотека выводит полезные сообщения в консоль:

```javascript
console.log('🔒 Scroll locked, scrollbar width: 15px');
console.log('👆 Touch start:', startY);
console.log('🔄 Drag started');
console.log('✅ Closing modal via swipe');
console.log('🔓 Scroll unlocked');
```

### Проверка поддержки

```javascript
console.log('Dialog support:', 'HTMLDialogElement' in window ? '✅ Supported' : '❌ Not supported');
console.log('Touch device:', isTouchDevice() ? '✅ Yes' : '❌ No');
```

## 🌐 Поддержка браузеров

### Современные браузеры
- Chrome 37+
- Firefox 98+
- Safari 15.4+
- Edge 79+

### Fallback для старых браузеров
Для браузеров без поддержки `<dialog>` автоматически используется div с аналогичным функционалом.

## 📄 Лицензия

MIT License - свободное использование в любых проектах.

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📞 Поддержка

- GitHub Issues для багов и предложений
- Документация на сайте проекта
- Stack Overflow с тегом `lightmodal`

---

Создано с ❤️ для современного веба