/*=========================================================================
 * 1. КОНТРОЛЬ ДАТ И ПРАЗДНИКОВ
=========================================================================*/
function checkBirthday() {
    const today = new Date();
    // 21 июня (в JS месяцы считаются с 0: 0 - январь, 5 - июнь)
    if (today.getDate() === 21 && today.getMonth() === 5) {
        const avatarBlock = document.getElementById('avatarBlock');
        const greeting = document.getElementById('greeting');
        const bdaySubtitle = document.getElementById('bdaySubtitle');
        
        if (avatarBlock) avatarBlock.classList.add('birthday-mode');
        if (greeting) greeting.innerText = "> С Днём Рождения меня! 🎂";
        if (bdaySubtitle) bdaySubtitle.innerText = "✦ Сегодня официальный день отдыха и праздника!";
    }
}

/*=========================================================================
 * 2. УПРАВЛЕНИЕ СИСТЕМНЫМИ ЭКРАНАМИ (DOCK NAV)
=========================================================================*/
const dockItems = document.querySelectorAll('.dock-item');
const screens = document.querySelectorAll('.screen-content');
const slider = document.querySelector('.dock-bg-slider');

function moveSlider(activeItem) {
    if (!activeItem || !slider) return;
    slider.style.width = `${activeItem.offsetWidth}px`;
    slider.style.left = `${activeItem.offsetLeft}px`;
}

function activateScreen(screenId) {
    const targetItem = document.querySelector(`.dock-item[data-screen="${screenId}"]`);
    const targetScreen = document.getElementById(screenId);

    if (!targetItem || !targetScreen) return;

    dockItems.forEach(i => i.classList.remove('active'));
    targetItem.classList.add('active');
    moveSlider(targetItem);

    screens.forEach(screen => screen.classList.remove('active'));
    targetScreen.classList.add('active');

    localStorage.setItem('lastActiveScreen', screenId);
}

/*=========================================================================
 * 3. МОДАЛЬНЫЕ ОКНА И СЛАЙДЕРЫ СЕЗОНОВ
=========================================================================*/
const globalModalOverlay = document.getElementById('globalModalOverlay');

function moveSeasonSlider(activeBtn, modalContainer) {
    const seasonSlider = modalContainer.querySelector('.season-slider-bg');
    if (!activeBtn || !seasonSlider) return;
    seasonSlider.style.width = `${activeBtn.offsetWidth}px`;
    seasonSlider.style.left = `${activeBtn.offsetLeft}px`;
}

function closeGlobalModal() {
    if (!globalModalOverlay) return;
    globalModalOverlay.classList.remove('open');
    
    // Снимаем блокировку скролла с html и body
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open'); 
}

// Инициализация работы модалок и переключения сезонов
function initModalSystem() {
    if (!globalModalOverlay) return;

    // Открытие модальных окон
    document.querySelectorAll('.open-modal-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            
            if (targetModal) {
                globalModalOverlay.classList.add('open');
                
                // Блокируем скролл намертво на всех уровнях
                document.documentElement.classList.add('modal-open');
                document.body.classList.add('modal-open'); 
                
                document.querySelectorAll('.animelib-modal-container, .profile-small-modal').forEach(m => m.classList.remove('active'));
                targetModal.classList.add('active');
                
                const firstSeasonBtn = targetModal.querySelector('.season-dock-item');
                if (firstSeasonBtn) {
                    targetModal.querySelectorAll('.season-dock-item').forEach(b => b.classList.remove('active'));
                    firstSeasonBtn.classList.add('active');
                    moveSeasonSlider(firstSeasonBtn, targetModal);
                    
                    const track = targetModal.querySelector('.modal-slider-track');
                    if (track) track.style.transform = `translateX(0%)`;
                }
            }
        });
    });

    // ... остальной код переключения сезонов и закрытия оверлея остается без изменений ...
    globalModalOverlay.addEventListener('click', (e) => {
        if (e.target === globalModalOverlay || e.target.classList.contains('close-modal-x') || e.target.classList.contains('close-modal-btn')) {
            closeGlobalModal();
        }
    });

    // Переключение вкладок/сезонов внутри модалки
    document.querySelectorAll('.season-dock-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalContainer = this.closest('.animelib-modal-container');
            const pageIndex = parseInt(this.getAttribute('data-index'));
            const track = modalContainer.querySelector('.modal-slider-track');
            
            modalContainer.querySelectorAll('.season-dock-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            moveSeasonSlider(this, modalContainer);
            
            if (track) {
                track.style.transform = `translateX(${pageIndex * -100}%)`;
            }
        });
    });

    // Закрытие по клику на оверлей или крестик
    globalModalOverlay.addEventListener('click', (e) => {
        if (e.target === globalModalOverlay || e.target.classList.contains('close-modal-x') || e.target.classList.contains('close-modal-btn')) {
            closeGlobalModal();
        }
    });
}

/*=========================================================================
 * 4. СИСТЕМА КОПИРОВАНИЯ (DISCORD С ТУЛТИПОМ / ИГРЫ НА МЕСТЕ)
=========================================================================*/
function initClipboardSystem() {
    // Тип 1: Discord (Всплывающий тултип по координатам клика)
    document.querySelectorAll('.discord-copy-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const textToCopy = this.getAttribute('data-clipboard');
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const tooltip = document.createElement('div');
                tooltip.className = 'clipboard-tooltip';
                tooltip.innerText = 'Скопировано!';
                document.body.appendChild(tooltip);
                
                tooltip.style.left = `${e.pageX}px`;
                tooltip.style.top = `${e.pageY - 30}px`;
                
                setTimeout(() => {
                    tooltip.classList.add('fade-out');
                    setTimeout(() => tooltip.remove(), 300);
                }, 1000);
            }).catch(err => console.error(err));
        });
    });
}

// Тип 2: Epic Games (Принудительно делаем функцию глобальной)
window.copyEpicHandle = function() {
    const handleElement = document.getElementById("epicHandle");
    if (!handleElement) return;

    const originalText = handleElement.innerText;
    if (originalText === "Скопировано!") return;

    navigator.clipboard.writeText(originalText).then(() => {
        handleElement.innerText = "Скопировано!";
        handleElement.style.color = "#00ff66";
        
        setTimeout(() => {
            handleElement.innerText = originalText;
            handleElement.style.color = "";
        }, 1000);
    }).catch(err => console.error(err));
};

// Тип 2: Xbox (Принудительно делаем функцию глобальной)
window.copyXboxHandle = function() {
    const handleElement = document.getElementById("xboxHandle");
    if (!handleElement) return;

    const originalText = handleElement.innerText;
    if (originalText === "Скопировано!") return;

    navigator.clipboard.writeText(originalText).then(() => {
        handleElement.innerText = "Скопировано!";
        handleElement.style.color = "#00ff66";
        
        setTimeout(() => {
            handleElement.innerText = originalText;
            handleElement.style.color = "";
        }, 1000);
    }).catch(err => console.error(err));
};

/*=========================================================================
 * 5. ГЛОБАЛЬНЫЕ СОБЫТИЯ И ИНИЦИАЛИЗАЦИЯ
 * ========================================================================*/
window.addEventListener('DOMContentLoaded', () => {
    // 1. Проверяем день рождения
    checkBirthday();
    
    // 2. Включаем модалки и копирование
    initModalSystem();
    initClipboardSystem();

    // 3. ОЖИВЛЯЕМ НИЖНЕЕ МЕНЮ (DOCK NAV)
    const dockItems = document.querySelectorAll('.dock-item');
    if (dockItems.length > 0) {
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetScreen = item.getAttribute('data-screen');
                activateScreen(targetScreen);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // 4. Восстановление сохраненного экрана из localStorage
    const savedScreen = localStorage.getItem('lastActiveScreen') || 'screen-main';
    activateScreen(savedScreen);
});

window.addEventListener('load', () => {
    setTimeout(() => {
        const activeItem = document.querySelector('.dock-item.active');
        if (activeItem) moveSlider(activeItem);
    }, 50);
});

// Оптимизация для resize (изменение размеров окна или поворот экрана)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const activeItem = document.querySelector('.dock-item.active');
        if (activeItem) moveSlider(activeItem);
        
        document.querySelectorAll('.animelib-modal-container').forEach(modal => {
            const activeSeasonBtn = modal.querySelector('.season-dock-item.active');
            if (activeSeasonBtn) moveSeasonSlider(activeSeasonBtn, modal);
        });
    }, 100);
});