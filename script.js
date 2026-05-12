// ===== КОНФИГУРАЦИЯ СЦЕН И ДАННЫЕ ===== 
const scenes = {
    entrance: {
        id: 'entrance',
        name: 'Главный вход',
        image: 'panoramas/entrance.jpg',
        description: 'Главный вход в здание университета. Это первое впечатление о нашем учреждении. Отсюда вы можете перейти в холл здания.',
        next: 'hall',
        prev: null
    },
    hall: {
        id: 'hall',
        name: 'Холл',
        image: 'panoramas/hall.jpg',
        description: 'Главный холл университета с информационной стойкой. Здесь размещены основные сведения о структуре здания и расписание мероприятий. Из холла можно попасть в коридоры здания.',
        next: 'corridor',
        prev: 'entrance'
    },
    corridor: {
        id: 'corridor',
        name: 'Коридор',
        image: 'panoramas/corridor.jpg',
        description: 'Основной коридор здания с доступом к различным помещениям. Здесь размещены аудитории, кабинеты преподавателей и лаборатории. Из коридора можно попасть в аудитории.',
        next: 'classroom',
        prev: 'hall'
    },
    classroom: {
        id: 'classroom',
        name: 'Аудитория',
        image: 'panoramas/classroom.jpg',
        description: 'Типичная студенческая аудитория, оборудованная современными средствами обучения. Здесь проводятся лекции и семинары. Это конец виртуального тура.',
        next: null,
        prev: 'corridor'
    }
};

// ===== ПЕРЕМЕННЫЕ СОСТОЯНИЯ =====
let currentScene = 'entrance';
let panorama = null;

// ===== ИНИЦИАЛИЗАЦИЯ ===== 
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

// ===== УПРАВЛЕНИЕ СОБЫТИЯМИ =====
function initializeEventListeners() {
    // Главная страница
    document.getElementById('start-tour-btn').addEventListener('click', goToTour);

    // Кнопки тура
    document.getElementById('home-btn').addEventListener('click', goHome);
    document.getElementById('map-btn').addEventListener('click', openMap);
    document.getElementById('info-btn').addEventListener('click', openInfo);

    // Кнопки навигации
    document.getElementById('next-scene-btn').addEventListener('click', goToNextScene);
    document.getElementById('prev-scene-btn').addEventListener('click', goToPreviousScene);

    // Кнопки карты
    document.querySelectorAll('.map-location').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sceneId = e.currentTarget.dataset.scene;
            goToScene(sceneId);
            closeMap();
        });
    });

    // Закрытие модальных окон
    document.getElementById('close-map-btn').addEventListener('click', closeMap);
    document.getElementById('close-info-btn').addEventListener('click', closeInfo);
    document.getElementById('modal-backdrop').addEventListener('click', closeAllModals);

    // Закрытие модалей на Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ===== НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ =====
function showPage(pageId) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Показать нужную страницу
    document.getElementById(pageId).classList.add('active');

    // Если это страница тура, загрузить панораму
    if (pageId === 'tour-page') {
        setTimeout(() => {
            loadPanorama(currentScene);
        }, 100);
    }
}

function goToTour() {
    currentScene = 'entrance';
    showPage('tour-page');
}

function goHome() {
    if (panorama) {
        panorama.destroy();
        panorama = null;
    }
    showPage('home-page');
    closeAllModals();
}

// ===== ЗАГРУЗКА ПАНОРАМЫ =====
function loadPanorama(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) return;

    currentScene = sceneId;

    // Обновить текущую локацию
    document.getElementById('current-location').textContent = scene.name;

    // Обновить активную кнопку на карте
    document.querySelectorAll('.map-location').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.scene === sceneId) {
            btn.classList.add('active');
        }
    });

    // Показать индикатор загрузки
    document.getElementById('loading-indicator').style.display = 'flex';
    document.getElementById('error-placeholder').style.display = 'none';

    // Уничтожить старую панораму если существует
    if (panorama) {
        panorama.destroy();
    }

    // Создать новую панораму
    try {
        panorama = pannellum.viewer('panorama', {
            type: 'equirectangular',
            panorama: scene.image,
            autoLoad: true,
            showControls: true,
            mouseZoom: true,
            touchZoom: true,
            
            // Обработчики событий
            onLoad: () => {
                document.getElementById('loading-indicator').style.display = 'none';
                document.getElementById('error-placeholder').style.display = 'none';
            },
            
            onError: (error) => {
                handlePanoramaError(scene);
            }
        });

        // Дополнительная проверка загрузки через время
        setTimeout(() => {
            if (panorama && !panorama.isLoaded()) {
                handlePanoramaError(scene);
            }
        }, 3000);

    } catch (error) {
        console.error('Ошибка при создании панорамы:', error);
        handlePanoramaError(scene);
    }
}

function handlePanoramaError(scene) {
    document.getElementById('loading-indicator').style.display = 'none';
    const errorPlaceholder = document.getElementById('error-placeholder');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = `Панорама не найдена: ${scene.image}`;
    errorPlaceholder.style.display = 'flex';

    // Показать описание сцены в плейсхолдере
    console.warn(`Панорама для сцены "${scene.name}" не загружена. Файл: ${scene.image}`);
    console.log(`Описание: ${scene.description}`);
}

// ===== НАВИГАЦИЯ ПО СЦЕНАМ =====
function goToScene(sceneId) {
    if (scenes[sceneId]) {
        loadPanorama(sceneId);
    }
}

function goToNextScene() {
    const scene = scenes[currentScene];
    if (scene && scene.next) {
        goToScene(scene.next);
    }
}

function goToPreviousScene() {
    const scene = scenes[currentScene];
    if (scene && scene.prev) {
        goToScene(scene.prev);
    }
}

// ===== УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ =====
function openMap() {
    document.getElementById('map-modal').classList.add('active');
    document.getElementById('modal-backdrop').classList.add('active');
}

function closeMap() {
    document.getElementById('map-modal').classList.remove('active');
    document.getElementById('modal-backdrop').classList.remove('active');
}

function openInfo() {
    const scene = scenes[currentScene];
    if (scene) {
        document.getElementById('info-title').textContent = scene.name;
        document.getElementById('info-description').textContent = scene.description;
        document.getElementById('info-modal').classList.add('active');
        document.getElementById('modal-backdrop').classList.add('active');
    }
}

function closeInfo() {
    document.getElementById('info-modal').classList.remove('active');
    document.getElementById('modal-backdrop').classList.remove('active');
}

function closeAllModals() {
    closeMap();
    closeInfo();
}

// ===== УТИЛИТЫ =====
// Функция для проверки наличия 360 фото (для будущего использования)
function checkImageExists(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageUrl;
    });
}

// ===== ДЕБАГ ФУНКЦИИ =====
// Разкомментируй для проверки структуры данных
/*
console.log('Сцены загружены:', scenes);
console.log('Текущая сцена:', currentScene);
*/
