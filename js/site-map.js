document.addEventListener('DOMContentLoaded', function () {
    const headers = document.querySelectorAll('.category-header');
    const tagLinks = document.querySelectorAll('.tag-link');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scrollAnimationId = 0;
    let scrollBehaviorBeforeAnimation = null;

    function easeInOutCubic(progress) {
        return progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }

    function getHeaderTop(header) {
        return header.getBoundingClientRect().top + window.pageYOffset;
    }

    function animateHeaderToTop(header) {
        const html = document.documentElement;
        const animationId = ++scrollAnimationId;

        if (scrollBehaviorBeforeAnimation === null) {
            scrollBehaviorBeforeAnimation = html.style.scrollBehavior;
        }
        html.style.scrollBehavior = 'auto';

        if (prefersReducedMotion) {
            window.scrollTo(0, getHeaderTop(header));
            html.style.scrollBehavior = scrollBehaviorBeforeAnimation;
            scrollBehaviorBeforeAnimation = null;
            return;
        }

        const duration = 760;
        const startedAt = performance.now();
        const startY = window.pageYOffset;

        function step(now) {
            if (animationId !== scrollAnimationId) {
                return;
            }

            const progress = Math.min((now - startedAt) / duration, 1);
            const targetY = getHeaderTop(header);
            const nextY = startY + ((targetY - startY) * easeInOutCubic(progress));

            window.scrollTo(0, nextY);

            if (progress < 1) {
                window.requestAnimationFrame(step);
                return;
            }

            window.scrollTo(0, getHeaderTop(header));
            html.style.scrollBehavior = scrollBehaviorBeforeAnimation;
            scrollBehaviorBeforeAnimation = null;
        }

        window.requestAnimationFrame(step);
    }

    // Функция для управления аккордеоном
    function toggleAccordion(header) {
        const content = header.nextElementSibling;
        if (!content) { return; }
        const isOpen = content.classList.contains('open');

        // Закрываем все открытые аккордеоны
        document.querySelectorAll('.categories-expo-posts.open').forEach(openContent => {
            if (openContent !== content) {
                openContent.classList.remove('open');
                openContent.style.maxHeight = '0';
                if (openContent.previousElementSibling) {
                    openContent.previousElementSibling.classList.remove('active');
                }
            }
        });

        // Открываем или закрываем текущий
        if (isOpen) {
            content.classList.remove('open');
            content.style.maxHeight = '0';
            header.classList.remove('active');
            animateHeaderToTop(header);
        } else {
            content.classList.add('open');
            content.style.maxHeight = content.scrollHeight + 'px';
            header.classList.add('active');
            animateHeaderToTop(header);
        }
    }

    // Обработчики для заголовков аккордеона
    headers.forEach(header => {
        header.addEventListener('click', function () {
            toggleAccordion(this);
        });
        header.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleAccordion(this);
            }
        });
    });

    // Обработчики для ссылок тегов
    tagLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const targetHeader = document.getElementById(targetId);

            if (targetHeader) {
                // Открываем аккордеон, если он не открыт
                if (!targetHeader.nextElementSibling || !targetHeader.nextElementSibling.classList.contains('open')) {
                    toggleAccordion(targetHeader);
                } else {
                    animateHeaderToTop(targetHeader);
                }
            }
        });
    });

    // Открытие аккордеона по хешу в URL
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetHeader = document.getElementById(hash);
        if (targetHeader) {
            setTimeout(() => {
                if (!targetHeader.nextElementSibling || !targetHeader.nextElementSibling.classList.contains('open')) {
                    toggleAccordion(targetHeader);
                } else {
                    animateHeaderToTop(targetHeader);
                }
            }, 300);
        }
    }
});
