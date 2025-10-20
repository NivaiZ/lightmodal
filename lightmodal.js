// LightModal 4.0.1 - Улучшенная версия с полным функционалом
(function () {
	'use strict';

	// ============================= //
	// КОНСТАНТЫ И УТИЛИТЫ
	// ============================= //

	const $ = (s, c = document) => c.querySelector(s);
	const $$ = (s, c = document) => c.querySelectorAll(s);
	const h = (tag, cls = '') => {
		const n = document.createElement(tag);
		if (cls) n.className = cls;
		return n;
	};

	// Утилита для глубокого слияния объектов
	const merge = (target, ...sources) => {
		for (const source of sources) {
			for (const key in source) {
				if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
					target[key] = target[key] || {};
					merge(target[key], source[key]);
				} else {
					target[key] = source[key];
				}
			}
		}
		return target;
	};

	// Media detection
	const IMG_RE = /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i;
	const VIDEO_RE = /\.(mp4|webm|ogg|m4v)(\?.*)?$/i;
	const YOUTUBE_RE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&#?]{11})/;
	const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/;
	const RUTUBE_RE = /rutube\.ru\/(?:video\/|play\/embed\/)([a-zA-Z0-9]+)/;
	const VK_RE = /vk\.com\/(?:video_ext\.php\?oid=(-?\d+)&id=(\d+)|video(-?\d+)_(\d+))/;

	const isImg = (type, src) => type === 'image' || (!type && IMG_RE.test(src));
	const isVideo = (type, src) => type === 'video' || (!type && VIDEO_RE.test(src));
	const getYouTubeId = url => (url.match(YOUTUBE_RE) || [])[1];
	const getVimeoId = url => (url.match(VIMEO_RE) || [])[1];
	const getRutubeId = url => (url.match(RUTUBE_RE) || [])[1];
	const getVkVideoId = url => {
		const match = url.match(VK_RE);
		if (!match) return null;
		// VK может иметь разные форматы URL
		if (match[1] && match[2]) {
			return { oid: match[1], id: match[2] };
		} else if (match[3] && match[4]) {
			return { oid: match[3], id: match[4] };
		}
		return null;
	};

	// Device detection
	const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	const isMobile = () => window.innerWidth <= 768;

	// States
	const States = {
		Init: 0,
		Ready: 1,
		Closing: 2,
		Destroyed: 3
	};

	// Scroll lock implementation
	const scrollLock = {
		locked: false,
		scrollbarWidth: 0,
		originalMargin: 0,

		getScrollbarWidth() {
			if (this.scrollbarWidth !== 0) return this.scrollbarWidth;
			const documentWidth = document.documentElement.clientWidth;
			const windowWidth = window.innerWidth;
			this.scrollbarWidth = Math.max(0, windowWidth - documentWidth);
			return this.scrollbarWidth;
		},

		lock() {
			if (this.locked) return;
			this.locked = true;

			const scrollbarWidth = this.getScrollbarWidth();
			const body = document.body;
			const html = document.documentElement;

			this.originalMargin = parseFloat(window.getComputedStyle(body).marginRight) || 0;

			html.style.setProperty('--lm-scrollbar-compensate', `${scrollbarWidth}px`);
			html.style.setProperty('--lm-body-margin', `${this.originalMargin}px`);

			html.classList.add('lm-scroll-locked');
			body.classList.add('lm-scroll-locked-body');

			if (scrollbarWidth > 0) {
				body.style.marginRight = `calc(var(--lm-body-margin, 0px) + var(--lm-scrollbar-compensate, 0px))`;
			}
		},

		unlock() {
			if (!this.locked) return;
			this.locked = false;

			const body = document.body;
			const html = document.documentElement;

			body.style.marginRight = '';
			html.classList.remove('lm-scroll-locked');
			body.classList.remove('lm-scroll-locked-body');
			html.style.removeProperty('--lm-scrollbar-compensate');
			html.style.removeProperty('--lm-body-margin');

			this.originalMargin = 0;
		}
	};

	// Focus trap
	const trapFocus = (container) => {
		const focusableElements = container.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		const firstFocusable = focusableElements[0];
		const lastFocusable = focusableElements[focusableElements.length - 1];

		const handleTabKey = (e) => {
			if (e.key !== 'Tab') return;

			if (e.shiftKey) {
				if (document.activeElement === firstFocusable) {
					lastFocusable?.focus();
					e.preventDefault();
				}
			} else {
				if (document.activeElement === lastFocusable) {
					firstFocusable?.focus();
					e.preventDefault();
				}
			}
		};

		container.addEventListener('keydown', handleTabKey);
		firstFocusable?.focus();

		return () => container.removeEventListener('keydown', handleTabKey);
	};

	// ============================= //
	// ГЛАВНЫЙ КЛАСС
	// ============================= //

	class LightModal {
		static instances = new Map();
		static instanceCounter = 0;
		static currentInstance = null;

		static defaults = {
			// Основные настройки
			mainClass: '',
			theme: 'dark', // 'dark' | 'light' | 'auto'

			// Управление
			closeButton: true,
			closeOnBackdrop: true,
			closeOnEsc: true,
			closeExisting: false,

			// Эффекты
			fadeEffect: true,
			zoomEffect: true,
			openSpeed: 366,
			closeSpeed: 366,

			// Функциональность
			dragToClose: true,
			touch: true,
			keyboard: true,
			autoFocus: true,
			restoreFocus: true,
			hideScrollbar: true,

			// Idle режим
			idle: 3000,

			// Контент
			spinnerTpl: '<div class="lm-spinner"></div>',
			errorTpl: '<div class="lm-error">Ошибка загрузки</div>',
			closeBtnTpl: '<button class="lm-close-btn" type="button" aria-label="Закрыть"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>',

			// Размеры
			width: null,
			height: null,

			// Callbacks
			on: {}
		};

		constructor(items, options = {}) {
			// Нормализация входных данных
			if (!Array.isArray(items)) {
				items = [items];
			}

			this.items = items.map(item => {
				if (typeof item === 'string') {
					return { src: item };
				}
				return item;
			});

			this.options = merge({}, LightModal.defaults, options);
			this.state = States.Init;
			this.id = `lm-${++LightModal.instanceCounter}`;

			// Текущий индекс
			this.currentIndex = this.options.startIndex || 0;

			// DOM элементы
			this.container = null;
			this.backdrop = null;
			this.contentWrapper = null;
			this.content = null;
			this.closeBtn = null;

			// Состояние
			this.isIdle = false;
			this.idleTimer = null;
			this.previousFocus = null;
			this.removeFocusTrap = null;

			// Touch/drag
			this.isDragging = false;
			this.dragStartY = 0;
			this.dragOffset = 0;

			// События
			this.events = new Map();

			// Инициализация
			this.init();
		}

		init() {
			// Закрываем существующие модалки если нужно
			if (this.options.closeExisting) {
				LightModal.closeAll();
			}

			// Сохраняем инстанс
			LightModal.instances.set(this.id, this);
			LightModal.currentInstance = this;

			// Создаём DOM
			this.createDOM();

			// Загружаем контент
			this.loadContent(this.items[this.currentIndex]);

			// Открываем
			this.open();

			// Emit init event
			this.emit('init');
		}

		createDOM() {
			// Используем dialog если поддерживается
			const useDialog = 'HTMLDialogElement' in window;

			// Создаём контейнер
			this.container = useDialog ? document.createElement('dialog') : h('div');
			this.container.className = 'lm-container';
			this.container.setAttribute('id', this.id);
			this.container.setAttribute('role', 'dialog');
			this.container.setAttribute('aria-modal', 'true');

			// Применяем тему
			const theme = this.options.theme;
			if (theme === 'auto') {
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				this.container.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
			} else {
				this.container.setAttribute('data-theme', theme);
			}

			// Backdrop
			this.backdrop = h('div', 'lm-backdrop');

			// Content wrapper
			this.contentWrapper = h('div', 'lm-content-wrapper');

			// Drag indicator для touch устройств
			if (isTouchDevice() && this.options.dragToClose) {
				const dragIndicator = h('div', 'lm-drag-indicator');
				this.contentWrapper.appendChild(dragIndicator);
				this.container.classList.add('is-touch');
			}

			// Close button
			if (this.options.closeButton) {
				const closeBtnHtml = this.options.closeBtnTpl;
				const tempDiv = h('div');
				tempDiv.innerHTML = closeBtnHtml;
				this.closeBtn = tempDiv.firstChild;
				this.contentWrapper.appendChild(this.closeBtn);
			}

			// Content
			this.content = h('div', 'lm-content');
			this.contentWrapper.appendChild(this.content);

			// Собираем структуру
			this.container.appendChild(this.backdrop);
			this.container.appendChild(this.contentWrapper);

			// Добавляем пользовательские классы
			if (this.options.mainClass) {
				this.container.classList.add(this.options.mainClass);
			}

			// Применяем размеры если указаны
			if (this.options.width) {
				this.contentWrapper.style.maxWidth =
					typeof this.options.width === 'number'
						? `${this.options.width}px`
						: this.options.width;
			}

			if (this.options.height) {
				this.contentWrapper.style.maxHeight =
					typeof this.options.height === 'number'
						? `${this.options.height}px`
						: this.options.height;
			}

			// Добавляем в DOM
			document.body.appendChild(this.container);

			// Присоединяем события
			this.attachEvents();
		}

		attachEvents() {
			// Backdrop click
			if (this.options.closeOnBackdrop) {
				this.backdrop.addEventListener('click', () => this.close());
			}

			// Close button
			if (this.closeBtn) {
				this.closeBtn.addEventListener('click', () => this.close());
			}

			// Keyboard
			if (this.options.keyboard) {
				this._keydownHandler = this.handleKeydown.bind(this);
				document.addEventListener('keydown', this._keydownHandler);
			}

			// Dialog events
			if (this.container instanceof HTMLDialogElement) {
				this.container.addEventListener('cancel', (e) => {
					e.preventDefault();
					if (this.options.closeOnEsc) {
						this.close();
					}
				});
			}

			// Drag to close
			if (this.options.dragToClose) {
				this.setupDragToClose();
			}

			// Idle mode
			if (this.options.idle) {
				this.setupIdleMode();
			}
		}

		handleKeydown(e) {
			if (this.state !== States.Ready) return;

			if (e.key === 'Escape' && this.options.closeOnEsc) {
				e.preventDefault();
				this.close();
			}

			// Navigation для галереи
			if (this.items.length > 1) {
				if (e.key === 'ArrowLeft') {
					e.preventDefault();
					this.prev();
				} else if (e.key === 'ArrowRight') {
					e.preventDefault();
					this.next();
				}
			}
		}

		setupDragToClose() {
			let startY = 0;
			let currentY = 0;
			let startX = 0;
			let currentX = 0;
			let isDragging = false;
			let dragAxis = null;
			let isMouseDown = false;

			// Универсальная функция для получения координат
			const getEventCoords = (e) => {
				if (e.touches && e.touches[0]) {
					return { x: e.touches[0].clientX, y: e.touches[0].clientY };
				} else if (e.changedTouches && e.changedTouches[0]) {
					return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
				}
				return { x: e.clientX, y: e.clientY };
			};

			const handleStart = (e) => {
				// Проверяем, что начали тянуть не с интерактивного элемента
				const target = e.target;
				if (target.closest('button, a, input, textarea, select, [contenteditable], iframe, video')) {
					return;
				}

				const coords = getEventCoords(e);
				startX = coords.x;
				startY = coords.y;
				currentX = startX;
				currentY = startY;
				isDragging = false;
				dragAxis = null;

				// Для mouse событий
				if (e.type === 'mousedown') {
					e.preventDefault();
					isMouseDown = true;
					this.contentWrapper.style.cursor = 'grabbing';
				}
			};

			const handleMove = (e) => {
				// Для мыши проверяем что кнопка нажата
				if (e.type === 'mousemove' && !isMouseDown) return;
				if (!startY && !startX) return;

				const coords = getEventCoords(e);
				currentX = coords.x;
				currentY = coords.y;

				const deltaX = currentX - startX;
				const deltaY = currentY - startY;

				// Определяем направление драга
				if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
					isDragging = true;
					dragAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
					this.contentWrapper.classList.add('is-dragging');

					// Предотвращаем выделение текста при драге мышью
					if (e.type === 'mousemove') {
						e.preventDefault();
						document.body.style.userSelect = 'none';
					}
				}

				if (isDragging) {
					let transform = '';
					let opacity = 1;
					let backdropOpacity = 1;

					// Вертикальный драг (вниз для закрытия)
					if (dragAxis === 'y' && deltaY > 0) {
						const progress = Math.min(deltaY / 200, 1);
						transform = `translateY(${deltaY}px)`;
						opacity = 1 - progress * 0.3;
						backdropOpacity = 1 - progress * 0.5;
					}
					// Горизонтальный драг (в любую сторону для закрытия)
					else if (dragAxis === 'x') {
						const progress = Math.min(Math.abs(deltaX) / 200, 1);
						transform = `translateX(${deltaX}px) scale(${1 - progress * 0.1})`;
						opacity = 1 - progress * 0.3;
						backdropOpacity = 1 - progress * 0.5;
					}

					this.contentWrapper.style.transform = transform;
					this.contentWrapper.style.opacity = opacity;
					this.backdrop.style.opacity = backdropOpacity;
				}
			};

			const handleEnd = (e) => {
				// Для мыши проверяем что была нажата
				if ((e.type === 'mouseup' || e.type === 'mouseleave') && !isMouseDown) return;

				isMouseDown = false;
				this.contentWrapper.style.cursor = '';
				document.body.style.userSelect = '';

				if (!isDragging) {
					this.contentWrapper.classList.remove('is-draggable');
					startX = 0;
					startY = 0;
					currentX = 0;
					currentY = 0;
					return;
				}

				const deltaX = currentX - startX;
				const deltaY = currentY - startY;

				this.contentWrapper.classList.remove('is-dragging');
				this.contentWrapper.classList.remove('is-draggable');

				// Проверяем условия для закрытия
				const shouldClose =
					(dragAxis === 'y' && deltaY > 100) ||
					(dragAxis === 'x' && Math.abs(deltaX) > 100);

				if (shouldClose) {
					// Добавляем класс для анимации выхода
					if (dragAxis === 'y') {
						this.contentWrapper.classList.add('lm-throw-out-down');
					} else if (deltaX > 0) {
						this.contentWrapper.classList.add('lm-throw-out-right');
					} else {
						this.contentWrapper.classList.add('lm-throw-out-left');
					}

					setTimeout(() => {
						this.close();
					}, 200);
				} else {
					// Возвращаем на место
					this.contentWrapper.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
					this.contentWrapper.style.transform = '';
					this.contentWrapper.style.opacity = '';
					this.backdrop.style.opacity = '';

					setTimeout(() => {
						this.contentWrapper.style.transition = '';
					}, 300);
				}

				// Сброс значений
				startX = 0;
				startY = 0;
				currentX = 0;
				currentY = 0;
				isDragging = false;
				dragAxis = null;
			};

			// Touch события
			this.contentWrapper.addEventListener('touchstart', handleStart, { passive: false });
			this.contentWrapper.addEventListener('touchmove', handleMove, { passive: false });
			this.contentWrapper.addEventListener('touchend', handleEnd, { passive: true });
			this.contentWrapper.addEventListener('touchcancel', handleEnd, { passive: true });

			// Mouse события для десктопа
			this.contentWrapper.addEventListener('mousedown', handleStart);

			// Глобальные mouse события
			document.addEventListener('mousemove', handleMove);
			document.addEventListener('mouseup', handleEnd);
			document.addEventListener('mouseleave', handleEnd);

			// Визуальная индикация при наведении
			this.contentWrapper.addEventListener('mouseenter', () => {
				if (!isDragging && this.options.dragToClose) {
					this.contentWrapper.style.cursor = 'grab';
				}
			});

			this.contentWrapper.addEventListener('mouseleave', () => {
				if (!isDragging) {
					this.contentWrapper.style.cursor = '';
				}
			});

			// Сохраняем для очистки
			this._dragCleanup = () => {
				this.contentWrapper.removeEventListener('touchstart', handleStart);
				this.contentWrapper.removeEventListener('touchmove', handleMove);
				this.contentWrapper.removeEventListener('touchend', handleEnd);
				this.contentWrapper.removeEventListener('touchcancel', handleEnd);
				this.contentWrapper.removeEventListener('mousedown', handleStart);
				document.removeEventListener('mousemove', handleMove);
				document.removeEventListener('mouseup', handleEnd);
				document.removeEventListener('mouseleave', handleEnd);
			};
		}

		setupIdleMode() {
			const resetIdle = () => {
				if (this.idleTimer) {
					clearTimeout(this.idleTimer);
				}

				if (this.isIdle) {
					this.isIdle = false;
					this.container.classList.remove('is-idle');
				}

				this.idleTimer = setTimeout(() => {
					this.isIdle = true;
					this.container.classList.add('is-idle');
				}, this.options.idle);
			};

			document.addEventListener('mousemove', resetIdle);
			resetIdle();

			// Cleanup
			this._idleCleanup = () => {
				document.removeEventListener('mousemove', resetIdle);
				if (this.idleTimer) {
					clearTimeout(this.idleTimer);
				}
			};
		}

		async loadContent(item) {
			const { src, type, dataSrcAdd } = item;

			// Показываем спиннер
			this.showLoader();

			// Добавляем класс из data-src-add
			if (dataSrcAdd) {
				this.contentWrapper.classList.add(dataSrcAdd);
			}

			try {
				// Inline content
				if (src.startsWith('#')) {
					const element = document.querySelector(src);
					if (element) {
						// Сохраняем оригинальные данные
						if (!element._originalParent) {
							element._originalParent = element.parentNode;
							element._originalNextSibling = element.nextSibling;
							element._originalStyleDisplay = element.style.display;
							element._originalClasses = element.className;
						}

						// Перемещаем элемент вместо клонирования
						element.style.display = 'block';
						this.setContent(element);
						this.content.classList.add('has-inline-content');

						// Сохраняем ссылку для возврата
						this.movedElement = element;
					} else {
						throw new Error(`Element ${src} not found`);
					}
					return;
				}

				// Images
				if (isImg(type, src)) {
					const img = new Image();

					await new Promise((resolve, reject) => {
						img.onload = resolve;
						img.onerror = reject;
						img.src = src;
					});

					img.alt = item.alt || item.caption || '';
					this.setContent(img);
					return;
				}

				// YouTube
				const youtubeId = getYouTubeId(src);
				if (youtubeId) {
					const params = new URLSearchParams({
						autoplay: 1,
						rel: 0,
						modestbranding: 1,
						playsinline: 1,
						fs: 1,
						enablejsapi: 1
					});
					const iframe = this.createIframe(
						`https://www.youtube.com/embed/${youtubeId}?${params.toString()}`
					);
					this.setContent(iframe);
					this.content.classList.add('has-iframe');
					return;
				}

				// Vimeo
				const vimeoId = getVimeoId(src);
				if (vimeoId) {
					const params = new URLSearchParams({
						autoplay: 1,
						playsinline: 1,
						byline: 0,
						portrait: 0
					});
					const iframe = this.createIframe(
						`https://player.vimeo.com/video/${vimeoId}?${params.toString()}`
					);
					this.setContent(iframe);
					this.content.classList.add('has-iframe');
					return;
				}

				// Rutube
				const rutubeId = getRutubeId(src);
				if (rutubeId) {
					const params = new URLSearchParams({
						autoplay: 1,
						playsinline: 1
					});
					const iframe = this.createIframe(
						`https://rutube.ru/play/embed/${rutubeId}?${params.toString()}`
					);
					this.setContent(iframe);
					this.content.classList.add('has-iframe');
					return;
				}

				// VK Video
				const vkVideoId = getVkVideoId(src);
				if (vkVideoId) {
					const iframe = this.createIframe(
						`https://vk.com/video_ext.php?oid=${vkVideoId.oid}&id=${vkVideoId.id}&hd=2&autoplay=1`
					);
					this.setContent(iframe);
					this.content.classList.add('has-iframe');
					return;
				}

				// Video
				if (isVideo(type, src)) {
					const video = h('video');
					video.src = src;
					video.controls = true;
					video.autoplay = true;
					video.muted = true;
					this.setContent(video);
					return;
				}

				// Generic iframe
				const iframe = this.createIframe(src);
				this.setContent(iframe);
				this.content.classList.add('has-iframe');

			} catch (error) {
				this.showError(error.message);
			}
		}

		createIframe(src) {
			const iframe = h('iframe');
			iframe.src = src;
			iframe.allowFullscreen = true;
			iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
			iframe.frameBorder = '0';
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.loading = 'lazy';
			return iframe;
		}

		setContent(element) {
			this.hideLoader();
			this.content.innerHTML = '';
			this.content.appendChild(element);

			// Caption
			const item = this.items[this.currentIndex];
			if (item.caption) {
				const caption = h('div', 'lm-caption');
				caption.textContent = item.caption;
				this.contentWrapper.appendChild(caption);
			}

			// EMIT CONTENT READY EVENT
			this.emit('contentReady', item);
		}

		showLoader() {
			if (!this.loader) {
				const tempDiv = h('div');
				tempDiv.innerHTML = this.options.spinnerTpl;
				this.loader = tempDiv.firstChild;
				this.content.appendChild(this.loader);
			}
			this.container.classList.add('is-loading');
		}

		hideLoader() {
			if (this.loader) {
				this.loader.remove();
				this.loader = null;
			}
			this.container.classList.remove('is-loading');
		}

		showError(message) {
			this.hideLoader();
			const errorDiv = h('div');
			errorDiv.innerHTML = this.options.errorTpl.replace('Ошибка загрузки', message);
			this.content.appendChild(errorDiv.firstChild);
		}

		open() {
			if (this.state !== States.Init) return;

			// Сохраняем фокус
			if (this.options.restoreFocus) {
				this.previousFocus = document.activeElement;
			}

			// Блокируем скролл
			if (this.options.hideScrollbar) {
				scrollLock.lock();
			}

			// Открываем dialog или показываем контейнер
			if (this.container instanceof HTMLDialogElement) {
				this.container.showModal();
			} else {
				this.container.style.display = 'flex';
			}

			// Запускаем анимацию открытия
			requestAnimationFrame(() => {
				this.container.classList.add('is-open');

				// Focus trap
				if (this.options.autoFocus) {
					this.removeFocusTrap = trapFocus(this.container);
				}
			});

			this.state = States.Ready;
			this.emit('open');
		}

		close() {
			if (this.state === States.Closing || this.state === States.Destroyed) return;

			this.state = States.Closing;

			// Убираем классы
			this.container.classList.remove('is-open');
			this.container.classList.add('is-closing');

			// Ждём окончания анимации
			const duration = this.options.closeSpeed;

			setTimeout(() => {
				this.destroy();
			}, duration);

			this.emit('close');
		}

		destroy() {
			if (this.state === States.Destroyed) return;

			// Очищаем классы contentWrapper
			if (this.contentWrapper) {
				this.contentWrapper.className = 'lm-content-wrapper';
			}

			// Cleanup drag
			if (this._dragCleanup) {
				this._dragCleanup();
			}

			// Cleanup idle mode
			if (this._idleCleanup) {
				this._idleCleanup();
			}

			// Remove focus trap
			if (this.removeFocusTrap) {
				this.removeFocusTrap();
			}

			// Restore focus
			if (this.options.restoreFocus && this.previousFocus) {
				this.previousFocus.focus();
			}

			// Remove event listeners
			if (this._keydownHandler) {
				document.removeEventListener('keydown', this._keydownHandler);
			}

			// Close dialog
			if (this.container instanceof HTMLDialogElement) {
				this.container.close();
			}

			// Remove from DOM
			this.container.remove();

			// Unlock scroll
			if (this.options.hideScrollbar) {
				scrollLock.unlock();
			}

			// ВОССТАНАВЛИВАЕМ ПЕРЕМЕЩЕННЫЙ ЭЛЕМЕНТ
			if (this.movedElement && this.movedElement._originalParent) {
				// Восстанавливаем оригинальные стили и классы
				this.movedElement.style.display = this.movedElement._originalStyleDisplay || 'none';
				this.movedElement.className = this.movedElement._originalClasses || '';

				// Возвращаем элемент на место
				if (this.movedElement._originalNextSibling) {
					this.movedElement._originalParent.insertBefore(
						this.movedElement,
						this.movedElement._originalNextSibling
					);
				} else {
					this.movedElement._originalParent.appendChild(this.movedElement);
				}

				// Очищаем временные данные
				delete this.movedElement._originalParent;
				delete this.movedElement._originalNextSibling;
				delete this.movedElement._originalStyleDisplay;
				delete this.movedElement._originalClasses;
			}

			// Clear instance
			LightModal.instances.delete(this.id);
			if (LightModal.currentInstance === this) {
				LightModal.currentInstance = null;
			}

			this.state = States.Destroyed;
			this.emit('destroy');
		}

		// Navigation methods for gallery
		next() {
			if (this.currentIndex < this.items.length - 1) {
				this.currentIndex++;
				this.loadContent(this.items[this.currentIndex]);
				this.emit('change', this.currentIndex);
			}
		}

		prev() {
			if (this.currentIndex > 0) {
				this.currentIndex--;
				this.loadContent(this.items[this.currentIndex]);
				this.emit('change', this.currentIndex);
			}
		}

		goTo(index) {
			if (index >= 0 && index < this.items.length) {
				this.currentIndex = index;
				this.loadContent(this.items[this.currentIndex]);
				this.emit('change', this.currentIndex);
			}
		}

		// Event system
		on(event, handler) {
			if (!this.events.has(event)) {
				this.events.set(event, []);
			}
			this.events.get(event).push(handler);
			return this;
		}

		off(event, handler) {
			const handlers = this.events.get(event);
			if (handlers) {
				const index = handlers.indexOf(handler);
				if (index > -1) {
					handlers.splice(index, 1);
				}
			}
			return this;
		}

		emit(event, ...args) {
			// User callbacks
			if (this.options.on[event]) {
				this.options.on[event](this, ...args);
			}

			// Registered handlers
			const handlers = this.events.get(event);
			if (handlers) {
				handlers.forEach(handler => handler(this, ...args));
			}
		}

		// Static methods
		static open(items, options) {
			return new LightModal(items, options);
		}

		static close() {
			if (LightModal.currentInstance) {
				LightModal.currentInstance.close();
			}
		}

		static closeAll() {
			for (const instance of LightModal.instances.values()) {
				instance.close();
			}
		}

		static getInstance(id) {
			if (id) {
				return LightModal.instances.get(id);
			}
			return LightModal.currentInstance;
		}

		// Auto-binding для data-атрибутов
		static bind(selector = '[data-lightmodal]') {
			document.addEventListener('click', (e) => {
				const trigger = e.target.closest(selector);
				if (!trigger) return;

				e.preventDefault();

				// Собираем все элементы галереи если есть data-gallery
				const galleryName = trigger.dataset.gallery;
				let items = [];
				let startIndex = 0;

				if (galleryName) {
					const galleryItems = document.querySelectorAll(`[data-gallery="${galleryName}"]`);
					galleryItems.forEach((item, index) => {
						if (item === trigger) {
							startIndex = index;
						}
						items.push({
							src: item.getAttribute('href') || item.dataset.src,
							type: item.dataset.type,
							caption: item.dataset.caption || item.getAttribute('title'),
							alt: item.dataset.alt,
							// Добавляем dataSrcAdd
							dataSrcAdd: item.dataset.srcAdd
						});
					});
				} else {
					items = [{
						src: trigger.getAttribute('href') || trigger.dataset.src,
						type: trigger.dataset.type,
						caption: trigger.dataset.caption || trigger.getAttribute('title'),
						alt: trigger.dataset.alt,
						// Добавляем dataSrcAdd для одиночного элемента
						dataSrcAdd: trigger.dataset.srcAdd
					}];
				}

				// Парсим опции из data-атрибутов
				const options = { startIndex };

				for (const key in trigger.dataset) {
					if (key.startsWith('lm')) {
						const optionKey = key.replace(/^lm/, '').toLowerCase();
						let value = trigger.dataset[key];

						// Преобразуем типы
						if (value === 'true') value = true;
						else if (value === 'false') value = false;
						else if (!isNaN(value)) value = +value;

						options[optionKey] = value;
					}
				}

				LightModal.open(items, options);
			});
		}
	}

	// ============================= //
	// ЭКСПОРТ И ИНИЦИАЛИЗАЦИЯ
	// ============================= //

	// Глобальный экспорт
	window.LightModal = LightModal;

	// Вспомогательные функции для обратной совместимости
	window.openModal = function (contentId) {
		LightModal.open(`#${contentId}`);
	};

	window.closeModal = function () {
		LightModal.close();
	};

	// Auto-bind при загрузке DOM
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => LightModal.bind());
	} else {
		LightModal.bind();
	}

	// Версия
	LightModal.version = '4.0.1';

	console.log('🚀 LightModal 4.0 initialized');

})();