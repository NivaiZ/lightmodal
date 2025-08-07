// LightModal 3.x – Полностью исправленная версия для работы с CSS
(function () {
	'use strict';

	// Helper functions
	const $ = (s, c = document) => c.querySelector(s);
	const $$ = (s, c = document) => c.querySelectorAll(s);
	const h = (tag, cls = '') => {
		const n = document.createElement(tag);
		if (cls) n.className = cls;
		return n;
	};

	// Media detection
	const IMG_RE = /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i;
	const VIDEO_RE = /\.(mp4|webm|ogg|m4v)(\?.*)?$/i;
	const isImg = (type, src) => type === 'image' || (!type && IMG_RE.test(src));
	const isVideo = (type, src) => type === 'video' || (!type && VIDEO_RE.test(src));

	// Video service detection
	const ytId = u => u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];
	const vmId = u => u.match(/vimeo\.com\/(?:video\/)?(\d{6,})/)?.[1];
	const ruId = u => u.match(/rutube\.ru\/(?:video|play\/embed)\/([a-f0-9-]{16,})/i)?.[1];
	const isVk = u => /vk\.com\/video/.test(u);

	// Device detection
	const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	const isMobile = () => window.innerWidth <= 768;

	// Accessibility helpers
	let liveRegion = null;
	const announce = (msg) => {
		if (!liveRegion) {
			liveRegion = h('div');
			liveRegion.setAttribute('aria-live', 'polite');
			liveRegion.setAttribute('aria-atomic', 'true');
			liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
			document.body.appendChild(liveRegion);
		}
		liveRegion.textContent = msg;
		setTimeout(() => liveRegion.textContent = '', 1000);
	};

	// Improved scroll lock
	const scrollLock = {
		locked: false,
		scrollbarWidth: 0,
		originalStyles: new Map(),

		getScrollbarWidth() {
			if (this.scrollbarWidth) return this.scrollbarWidth;

			const scrollDiv = h('div');
			scrollDiv.style.cssText = `
				position: absolute;
				top: -9999px;
				width: 50px;
				height: 50px;
				overflow: scroll;
			`;
			document.body.appendChild(scrollDiv);
			this.scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			document.body.removeChild(scrollDiv);

			return this.scrollbarWidth;
		},

		lock() {
			if (this.locked) return;
			this.locked = true;

			const scrollbarWidth = this.getScrollbarWidth();
			const body = document.body;
			const html = document.documentElement;

			this.originalStyles.set('body-overflow', body.style.overflow);
			this.originalStyles.set('body-paddingRight', body.style.paddingRight);
			this.originalStyles.set('html-overflow', html.style.overflow);

			html.style.setProperty('--lm-scrollbar-width', `${scrollbarWidth}px`);
			html.classList.add('lm-scroll-locked');
			body.classList.add('lm-scroll-locked', 'lm-scroll-locked-body');

			if (scrollbarWidth > 0) {
				// Не устанавливаем paddingRight напрямую - CSS сделает это через переменную
				const fixedElements = $$('[style*="position: fixed"], .fixed-header, .fixed-sidebar');
				fixedElements.forEach(el => {
					el.setAttribute('data-lm-fixed-compensated', 'true');
				});
			}

			console.log(`🔒 Scroll locked, scrollbar width: ${scrollbarWidth}px`);
		},

		unlock() {
			if (!this.locked) return;
			this.locked = false;

			const body = document.body;
			const html = document.documentElement;

			body.style.overflow = this.originalStyles.get('body-overflow') || '';
			body.style.paddingRight = this.originalStyles.get('body-paddingRight') || '';
			html.style.overflow = this.originalStyles.get('html-overflow') || '';

			html.classList.remove('lm-scroll-locked');
			body.classList.remove('lm-scroll-locked', 'lm-scroll-locked-body');
			html.style.removeProperty('--lm-scrollbar-width');

			const compensatedElements = $$('[data-lm-fixed-compensated="true"]');
			compensatedElements.forEach(el => {
				el.removeAttribute('data-lm-fixed-compensated');
			});

			this.originalStyles.clear();
			console.log('🔓 Scroll unlocked');
		}
	};

	// Focus management
	let previousFocus = null;
	const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

	const trapFocus = (container) => {
		const focusable = $$(focusableElements, container);
		const firstFocusable = focusable[0];
		const lastFocusable = focusable[focusable.length - 1];

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
		return () => container.removeEventListener('keydown', handleTabKey);
	};

	class LightModal {
		static current = null;
		static defaults = {
			mainClass: '',
			backdrop: true,
			backdropClick: true,
			keyboard: true,
			focus: true,
			compact: false,
			autoFocus: true,
			restoreFocus: true,
			dragToClose: true,
			touch: true,
			modal: true,
			width: null,
			height: null,
			openSpeed: 366,
			closeSpeed: 366,
			closeBtn: true,
			autoPlay: true,
			iframe: {
				scrolling: 'auto',
				preload: true
			},
			ajax: {
				dataType: 'html',
				headers: {}
			},
			keys: {
				close: [27] // escape
			}
		};

		// Auto-binding
		static bind(selector = '[data-lightmodal]') {
			document.addEventListener('click', e => {
				const trigger = e.target.closest(selector);
				if (!trigger) return;
				e.preventDefault();
				this.openFromTrigger(trigger);
			});
		}

		static openFromTrigger(trigger) {
			const src = trigger.getAttribute('href') || trigger.dataset.src;
			if (!src) return;

			const item = {
				src,
				type: trigger.dataset.type,
				caption: trigger.dataset.caption || trigger.getAttribute('title'),
				alt: trigger.dataset.alt,
				triggerEl: trigger
			};

			// Parse data attributes as options
			const options = { ...this.defaults };
			Object.keys(trigger.dataset).forEach(key => {
				if (key.startsWith('lm')) {
					const optionKey = key.replace(/^lm([A-Z])/, (_, letter) => letter.toLowerCase())
						.replace(/^lm/, '').toLowerCase();
					const value = trigger.dataset[key];

					if (value === 'true') options[optionKey] = true;
					else if (value === 'false') options[optionKey] = false;
					else if (!isNaN(value)) options[optionKey] = +value;
					else options[optionKey] = value;
				}
			});

			new LightModal(item, options);
		}

		static open(item, options = {}) {
			return new LightModal(item, options);
		}

		static close() {
			if (LightModal.current) {
				LightModal.current.close();
			}
		}

		constructor(item, options = {}) {
			// Normalize item
			if (typeof item === 'string') {
				item = { src: item };
			}

			this.item = item;
			this.options = { ...LightModal.defaults, ...options };
			this.isOpen = false;
			this.isClosing = false;
			this.removeFocusTrap = null;
			this.animationTimer = null;

			// Touch/swipe properties
			this.isDragging = false;
			this.dragStartY = 0;
			this.dragCurrentY = 0;
			this.dragStartTime = 0;
			this.dragThreshold = 50;
			this.velocityThreshold = 0.3;

			this.createDOM();
			this.attachEvents();
			this.renderContent().then(() => this.show());

			LightModal.current = this;
		}

		createDOM() {
			// Use native dialog if supported
			this.useDialog = ('HTMLDialogElement' in window) && this.options.modal !== false;

			this.container = this.useDialog
				? document.createElement('dialog')
				: h('div');

			this.container.className = 'lm-container';
			this.container.setAttribute('role', 'dialog');
			this.container.setAttribute('aria-modal', 'true');
			// ИСПРАВЛЕНИЕ: НЕ устанавливаем aria-hidden при создании
			// this.container.setAttribute('aria-hidden', 'true');

			// Create backdrop
			this.backdrop = h('div', 'lm-backdrop');

			// Create content wrapper
			this.contentWrapper = h('div', 'lm-content-wrapper');

			// Create drag indicator for touch devices
			if (isTouchDevice() && this.options.dragToClose) {
				this.dragIndicator = h('div', 'lm-drag-indicator');
				this.contentWrapper.appendChild(this.dragIndicator);
				this.container.classList.add('is-touch');
			}

			// Create close button
			if (this.options.closeBtn) {
				this.closeBtn = h('button', 'lm-close-btn');
				this.closeBtn.setAttribute('type', 'button');
				this.closeBtn.setAttribute('aria-label', 'Закрыть');
				this.closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>';
				this.contentWrapper.appendChild(this.closeBtn);
			}

			// Create content container
			this.content = h('div', 'lm-content');
			this.content.setAttribute('id', 'lm-content');
			this.contentWrapper.appendChild(this.content);

			// Create caption container if needed
			if (this.item.caption) {
				this.caption = h('div', 'lm-caption');
				this.caption.textContent = this.item.caption;
				this.contentWrapper.appendChild(this.caption);
			}

			// Assemble DOM
			this.container.appendChild(this.backdrop);
			this.container.appendChild(this.contentWrapper);

			// Apply custom classes
			if (this.options.mainClass) {
				this.container.classList.add(this.options.mainClass);
			}

			if (this.options.compact) {
				this.container.classList.add('is-compact');
			}

			if (isMobile() && this.options.touch) {
				this.container.classList.add('is-mobile-bottom');
			}

			// Apply custom dimensions
			if (this.options.width) {
				this.contentWrapper.style.width = typeof this.options.width === 'number'
					? `${this.options.width}px` : this.options.width;
			}
			if (this.options.height) {
				this.contentWrapper.style.height = typeof this.options.height === 'number'
					? `${this.options.height}px` : this.options.height;
			}

			// ИСПРАВЛЕНИЕ: Устанавливаем CSS переменную для анимации
			this.container.style.setProperty('--lm-duration', `${this.options.openSpeed}ms`);

			document.body.appendChild(this.container);
		}

		attachEvents() {
			// Backdrop click
			if (this.options.backdropClick) {
				this.backdrop.addEventListener('click', () => this.close());
			}

			// Close button
			if (this.closeBtn) {
				this.closeBtn.addEventListener('click', () => this.close());
			}

			// Keyboard events
			if (this.options.keyboard) {
				this._keydownHandler = this.handleKeydown.bind(this);
				document.addEventListener('keydown', this._keydownHandler);
			}

			// Touch events для swipe
			if (this.options.touch && isTouchDevice() && this.options.dragToClose) {
				this.setupSwipeToClose();
			}

			// Dialog events
			if (this.useDialog) {
				this.container.addEventListener('close', () => {
					if (!this.isClosing) this.close();
				});
				this.container.addEventListener('cancel', (e) => {
					e.preventDefault();
					this.close();
				});
				// Закрытие по клику на backdrop для dialog
				this.container.addEventListener('click', (e) => {
					if (e.target === this.container && this.options.backdropClick) {
						this.close();
					}
				});
			}
		}

		handleKeydown(e) {
			if (!this.isOpen) return;

			if (this.options.keys.close.includes(e.keyCode)) {
				e.preventDefault();
				this.close();
			}
		}

		setupSwipeToClose() {
			const touchTarget = this.contentWrapper;

			const handleTouchStart = (e) => {
				if (this.isDragging) return;

				this.isDragging = false;
				this.dragStartY = e.touches[0].clientY;
				this.dragCurrentY = this.dragStartY;
				this.dragStartTime = Date.now();

				touchTarget.classList.add('is-draggable');
			};

			const handleTouchMove = (e) => {
				if (!this.dragStartY) return;

				this.dragCurrentY = e.touches[0].clientY;
				const deltaY = this.dragCurrentY - this.dragStartY;
				const absDeltaY = Math.abs(deltaY);

				if (absDeltaY > 10 && !this.isDragging) {
					this.isDragging = true;
				}

				if (this.isDragging) {
					const progress = Math.min(absDeltaY / 200, 1);

					if (deltaY > 0) {
						// Используем CSS переменные для анимации drag
						touchTarget.style.setProperty('--lm-drag-offset', `${deltaY}px`);
						touchTarget.style.setProperty('--lm-drag-opacity', 1 - (progress * 0.3));
						this.backdrop.style.opacity = 1 - (progress * 0.5);
					}

					e.preventDefault();
				}
			};

			const handleTouchEnd = (e) => {
				if (!this.dragStartY) return;

				const deltaY = this.dragCurrentY - this.dragStartY;
				const deltaTime = Date.now() - this.dragStartTime;
				const velocity = Math.abs(deltaY) / (deltaTime || 1);

				touchTarget.classList.remove('is-draggable');

				if (this.isDragging) {
					if ((deltaY > this.dragThreshold) || (velocity > this.velocityThreshold && deltaY > 20)) {
						this.close();
					} else {
						// Сбрасываем CSS переменные
						touchTarget.style.removeProperty('--lm-drag-offset');
						touchTarget.style.removeProperty('--lm-drag-opacity');
						this.backdrop.style.opacity = '';
					}
				}

				this.isDragging = false;
				this.dragStartY = 0;
				this.dragCurrentY = 0;
				this.dragStartTime = 0;
			};

			touchTarget.addEventListener('touchstart', handleTouchStart, { passive: true });
			touchTarget.addEventListener('touchmove', handleTouchMove, { passive: false });
			touchTarget.addEventListener('touchend', handleTouchEnd, { passive: true });
			touchTarget.addEventListener('touchcancel', handleTouchEnd, { passive: true });

			this._touchStartHandler = handleTouchStart;
			this._touchMoveHandler = handleTouchMove;
			this._touchEndHandler = handleTouchEnd;
		}

		async renderContent() {
			const { src, type } = this.item;

			// Show loading spinner
			this.showLoader();

			try {
				// Handle inline content
				if (src.startsWith('#')) {
					const element = document.querySelector(src);
					if (element) {
						const clone = element.cloneNode(true);
						clone.style.display = 'block';
						clone.style.visibility = 'visible';
						clone.classList.remove('inline-content');
						clone.removeAttribute('hidden');

						const hiddenChildren = clone.querySelectorAll('.inline-content, [hidden]');
						hiddenChildren.forEach(child => {
							child.style.display = 'block';
							child.style.visibility = 'visible';
							child.classList.remove('inline-content');
							child.removeAttribute('hidden');
						});

						this.hideLoader();
						this.content.appendChild(clone);
						this.content.classList.add('has-inline-content');
						return;
					} else {
						throw new Error(`Element ${src} not found`);
					}
				}

				// Handle AJAX content
				if (type === 'ajax') {
					try {
						const response = await fetch(src, {
							credentials: 'same-origin',
							...this.options.ajax
						});
						if (!response.ok) throw new Error(`HTTP ${response.status}`);
						const content = await response.text();
						this.hideLoader();
						this.content.innerHTML = content;
						this.content.classList.add('has-inline-content');
					} catch (error) {
						this.hideLoader();
						this.content.innerHTML = `<p style="color: red;">Ошибка загрузки: ${error.message}</p>`;
						this.content.classList.add('has-inline-content');
					}
					return;
				}

				// Handle images
				if (isImg(type, src)) {
					const img = new Image();
					img.onload = () => {
						this.hideLoader();
						this.content.appendChild(img);
						this.updateSize();
					};
					img.onerror = () => {
						this.hideLoader();
						this.content.innerHTML = `<p style="color: red;">Ошибка загрузки изображения: ${src}</p>`;
						this.content.classList.add('has-inline-content');
					};
					img.src = src;
					img.alt = this.item.alt || this.item.caption || '';
					return;
				}

				// Handle videos and video services
				if (isVideo(type, src) || ytId(src) || vmId(src) || ruId(src) || isVk(src)) {
					this.hideLoader();
					this.content.classList.add('has-iframe');

					if (isVideo(type, src)) {
						const video = h('video');
						video.src = src;
						video.controls = true;
						video.playsInline = true;
						if (this.options.autoPlay) {
							video.autoplay = true;
							video.muted = true;
						}
						this.content.appendChild(video);
						return;
					}

					// Handle YouTube
					if (ytId(src)) {
						return this.createIframe(`https://www.youtube.com/embed/${ytId(src)}?autoplay=${this.options.autoPlay ? 1 : 0}&rel=0`);
					}

					// Handle Vimeo
					if (vmId(src)) {
						return this.createIframe(`https://player.vimeo.com/video/${vmId(src)}?autoplay=${this.options.autoPlay ? 1 : 0}&title=0&byline=0`);
					}

					// Handle RuTube
					if (ruId(src)) {
						return this.createIframe(`https://rutube.ru/play/embed/${ruId(src)}?autoplay=${this.options.autoPlay ? 1 : 0}`);
					}

					// Handle VK
					if (isVk(src)) {
						const separator = src.includes('?') ? '&' : '?';
						return this.createIframe(`${src}${separator}autoplay=${this.options.autoPlay ? 1 : 0}`);
					}
				}

				// Handle generic iframe content
				this.hideLoader();
				this.content.classList.add('has-iframe');
				this.createIframe(src);

			} catch (error) {
				this.hideLoader();
				this.content.innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
				this.content.classList.add('has-inline-content');
			}
		}

		showLoader() {
			if (!this.loader) {
				this.loader = h('div', 'lm-spinner');
				this.content.appendChild(this.loader);
			}
		}

		hideLoader() {
			if (this.loader) {
				this.loader.remove();
				this.loader = null;
			}
		}

		createIframe(url) {
			const iframe = h('iframe');
			iframe.src = url;
			iframe.allowFullscreen = true;
			iframe.frameBorder = '0';
			iframe.scrolling = this.options.iframe.scrolling;
			iframe.style.width = '100%';
			iframe.style.height = '100%';

			this.content.appendChild(iframe);
		}

		updateSize() {
			// Auto-size logic if needed
		}

		show() {
			if (this.isOpen) return;

			// Store previous focus
			if (this.options.restoreFocus) {
				previousFocus = document.activeElement;
			}

			// Lock scroll ПЕРЕД показом модалки
			scrollLock.lock();

			this.isOpen = true;

			if (this.useDialog) {
				try {
					this.container.showModal();
				} catch (e) {
					this.container.setAttribute('open', '');
				}
			}

			// ИСПРАВЛЕНИЕ: правильная последовательность для анимации
			// Сначала показываем контейнер
			this.container.style.display = 'flex';

			// Затем через requestAnimationFrame добавляем класс для анимации
			requestAnimationFrame(() => {
				this.container.classList.add('is-open');
				// Убираем aria-hidden только после начала анимации
				this.container.removeAttribute('aria-hidden');
			});

			// Set up focus management
			if (this.options.focus) {
				this.removeFocusTrap = trapFocus(this.container);

				if (this.options.autoFocus) {
					setTimeout(() => {
						const focusTarget = $(focusableElements, this.content) || this.closeBtn;
						focusTarget?.focus();
					}, 150);
				}
			}

			// Announce to screen readers
			announce('Модальное окно открыто');

			// Trigger custom event
			this.container.dispatchEvent(new CustomEvent('lightmodal:show', {
				detail: { instance: this, item: this.item }
			}));
		}

		close() {
			if (!this.isOpen || this.isClosing) return;

			console.log('🚪 Starting close animation...');

			this.isClosing = true;
			this.isOpen = false;

			// Clear animation timer
			if (this.animationTimer) {
				clearTimeout(this.animationTimer);
				this.animationTimer = null;
			}

			// Update CSS variable for close animation
			this.container.style.setProperty('--lm-duration', `${this.options.closeSpeed}ms`);

			// Start closing animation
			this.container.classList.remove('is-open');
			this.container.classList.add('is-closing');

			// Remove focus trap
			if (this.removeFocusTrap) {
				this.removeFocusTrap();
				this.removeFocusTrap = null;
			}

			// Restore focus
			if (this.options.restoreFocus && previousFocus) {
				previousFocus.focus();
				previousFocus = null;
			}

			// Get animation duration
			const animationDuration = this.options.closeSpeed || 366;

			console.log('⏱️ Animation duration:', animationDuration + 'ms');

			// Wait for animation to complete
			this.animationTimer = setTimeout(() => {
				console.log('✅ Animation complete, cleaning up...');
				this.cleanupDOM();
			}, animationDuration);

			// Unlock scroll after animation
			setTimeout(() => {
				scrollLock.unlock();
			}, animationDuration + 50);

			// Announce to screen readers
			announce('Модальное окно закрыто');
		}

		cleanupDOM() {
			console.log('🧹 Cleaning up DOM...');

			// Set aria-hidden before removing
			this.container.setAttribute('aria-hidden', 'true');

			// Handle dialog closing
			if (this.useDialog) {
				try {
					this.container.close();
				} catch (e) {
					console.warn('Dialog close failed:', e);
				}
			}

			// Remove from DOM
			if (this.container.parentNode) {
				this.container.parentNode.removeChild(this.container);
			}

			// Remove event listeners
			if (this._keydownHandler) {
				document.removeEventListener('keydown', this._keydownHandler);
			}

			// Remove touch event listeners
			if (this._touchStartHandler && this.contentWrapper) {
				this.contentWrapper.removeEventListener('touchstart', this._touchStartHandler);
				this.contentWrapper.removeEventListener('touchmove', this._touchMoveHandler);
				this.contentWrapper.removeEventListener('touchend', this._touchEndHandler);
				this.contentWrapper.removeEventListener('touchcancel', this._touchEndHandler);
			}

			// Clear current instance
			if (LightModal.current === this) {
				LightModal.current = null;
			}

			// Reset closing state
			this.isClosing = false;

			// Trigger custom event
			document.dispatchEvent(new CustomEvent('lightmodal:close', {
				detail: { instance: this, item: this.item }
			}));

			console.log('🎉 Modal fully closed and cleaned up');
		}
	}

	// ============================= //
	// DEMO FUNCTIONS (simplified)
	// ============================= //

	window.openModal = function (contentId) {
		LightModal.open(`#${contentId}`, { type: 'inline' });
	};

	window.closeModal = function () {
		LightModal.close();
	};

	window.openProgrammatically = () => {
		LightModal.open({
			src: '#inline-simple',
			type: 'inline',
			caption: 'Programmatically opened modal'
		}, {
			mainClass: 'lm-zoom-in'
		});
	};

	// Global export
	window.LightModal = LightModal;

	// Auto-bind when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => LightModal.bind());
	} else {
		LightModal.bind();
	}

	// Handle browser back/forward
	window.addEventListener('popstate', () => {
		if (LightModal.current && LightModal.current.item.src.startsWith('#')) {
			LightModal.current.close();
		}
	});

	// Debug info
	console.log('🚀 LightModal 3.x initialized');
	console.log('Dialog support:', 'HTMLDialogElement' in window ? '✅ Supported' : '❌ Not supported');
	console.log('Touch device:', isTouchDevice() ? '✅ Yes' : '❌ No');

})();