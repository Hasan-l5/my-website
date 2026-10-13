// CodeStart JavaScript functionality

document.addEventListener('DOMContentLoaded', () => {
  // ==================== DARK / LIGHT THEME TOGGLE ====================
  let savedTheme = localStorage.getItem('codestart_theme');
  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtns = document.querySelectorAll('.btn-theme-toggle');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('codestart_theme', newTheme);
    });
  });

  // Animate FAQ disclosure while keeping the native details/summary keyboard behavior.
  document.querySelectorAll('.faq-item').forEach(details => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.faq-answer');
    if (!summary || !answer || typeof answer.animate !== 'function') return;

    summary.setAttribute('aria-expanded', String(details.open));
    let isAnimating = false;

    summary.addEventListener('click', event => {
      event.preventDefault();
      if (isAnimating) return;

      const opening = !details.open;
      const startHeight = opening ? 0 : answer.getBoundingClientRect().height;
      if (opening) details.open = true;
      summary.setAttribute('aria-expanded', String(opening));
      isAnimating = true;

      const animation = answer.animate(
        [
          { height: `${startHeight}px`, opacity: opening ? 0 : 1 },
          { height: `${opening ? answer.scrollHeight : 0}px`, opacity: opening ? 1 : 0 }
        ],
        { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260, easing: 'ease', fill: 'both' }
      );

      animation.onfinish = () => {
        if (!opening) details.open = false;
        answer.style.removeProperty('height');
        answer.style.removeProperty('opacity');
        animation.cancel();
        isAnimating = false;
      };
    });
  });

  // ==================== AUTH & DEMO TOGGLE STATE ====================
  let authState = localStorage.getItem('codestart_auth_state') || 'auth';

  let userData = JSON.parse(localStorage.getItem('codestart_user_profile') || JSON.stringify({
    fullName: 'Александр Смирнов',
    username: 'alex_smirnov',
    email: 'alex.smirnov@mail.ru'
  }));

  function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0] ? parts[0].slice(0, 2).toUpperCase() : 'АС';
  }

  function getFirstName(name) {
    return name.trim().split(/\s+/)[0] || 'Александр';
  }

  function renderUserData() {
    const initials = getInitials(userData.fullName);
    const firstName = getFirstName(userData.fullName);

    const headerInitials = document.getElementById('header-avatar-initials');
    const headerFirstName = document.getElementById('header-user-firstname');
    if (headerInitials) headerInitials.textContent = initials;
    if (headerFirstName) headerFirstName.textContent = firstName;

    const profileAvatar = document.getElementById('profile-page-avatar');
    const profileFullname = document.getElementById('profile-page-fullname');
    const profileHandle = document.getElementById('profile-page-handle');
    if (profileAvatar) profileAvatar.textContent = initials;
    if (profileFullname) profileFullname.textContent = userData.fullName;
    if (profileHandle) profileHandle.textContent = `@${userData.username} · ${userData.email}`;

    const editName = document.getElementById('edit-name');
    const editUsername = document.getElementById('edit-username');
    const editEmail = document.getElementById('edit-email');
    if (editName) editName.value = userData.fullName;
    if (editUsername) editUsername.value = userData.username;
    if (editEmail) editEmail.value = userData.email;
  }

  function updateAuthUI(state) {
    const profileWidgets = document.querySelectorAll('.user-profile-widget');
    const loginButtons = document.querySelectorAll('.btn-login');
    const toggleDots = document.querySelectorAll('.demo-toggle-dot');

    if (state === 'auth') {
      profileWidgets.forEach(w => w.style.display = 'block');
      loginButtons.forEach(b => b.style.display = 'none');
      toggleDots.forEach(d => {
        d.classList.remove('state-guest');
        d.setAttribute('data-tooltip', 'Режим: Профиль (кликните точку, чтобы скрыть профиль и показать «Войти»)');
      });
    } else {
      profileWidgets.forEach(w => w.style.display = 'none');
      loginButtons.forEach(b => b.style.display = 'inline-block');
      toggleDots.forEach(d => {
        d.classList.add('state-guest');
        d.setAttribute('data-tooltip', 'Режим: Гость (кликните точку, чтобы показать аккаунт профиля)');
      });
    }
    localStorage.setItem('codestart_auth_state', state);
  }

  renderUserData();
  updateAuthUI(authState);

  const demoToggleBtn = document.getElementById('demo-auth-toggle');
  if (demoToggleBtn) {
    demoToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      authState = (authState === 'auth') ? 'guest' : 'auth';
      updateAuthUI(authState);

      demoToggleBtn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        demoToggleBtn.style.transform = '';
      }, 150);
    });
  }

  const profileWidget = document.getElementById('user-profile-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const profileBtnLink = profileWidget ? profileWidget.querySelector('.user-profile-btn') : null;

  if (profileBtnLink && userDropdown) {
    profileBtnLink.addEventListener('click', (e) => {
      e.preventDefault();
      userDropdown.classList.toggle('active');
      profileWidget.classList.toggle('menu-active');
    });

    document.addEventListener('click', (e) => {
      if (!profileWidget.contains(e.target)) {
        userDropdown.classList.remove('active');
        profileWidget.classList.remove('menu-active');
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authState = 'guest';
      updateAuthUI('guest');
      if (userDropdown) userDropdown.classList.remove('active');
      if (profileWidget) profileWidget.classList.remove('menu-active');
    });
  }

  // Редактирование профиля
  const openEditProfileBtn = document.getElementById('open-edit-profile-btn');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const editProfileForm = document.getElementById('edit-profile-form');

  if (openEditProfileBtn && editProfileModal) {
    openEditProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderUserData();
      editProfileModal.classList.add('active');
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      userData.fullName = document.getElementById('edit-name').value.trim() || userData.fullName;
      userData.username = document.getElementById('edit-username').value.trim().replace(/^@/, '') || userData.username;
      userData.email = document.getElementById('edit-email').value.trim() || userData.email;

      localStorage.setItem('codestart_user_profile', JSON.stringify(userData));
      renderUserData();
      if (editProfileModal) editProfileModal.classList.remove('active');
      alert('Данные профиля успешно сохранены!');
    });
  }

  // Вкладки курсов в профиле
  const tabInProgress = document.getElementById('tab-in-progress');
  const tabCompleted = document.getElementById('tab-completed');
  const coursesList = document.getElementById('profile-courses-list');
  const emptyCompleted = document.getElementById('empty-completed-courses');

  if (tabInProgress && tabCompleted && coursesList && emptyCompleted) {
    tabInProgress.addEventListener('click', () => {
      tabInProgress.classList.add('active');
      tabCompleted.classList.remove('active');
      coursesList.style.display = 'grid';
      emptyCompleted.style.display = 'none';
    });

    tabCompleted.addEventListener('click', () => {
      tabCompleted.classList.add('active');
      tabInProgress.classList.remove('active');
      coursesList.style.display = 'none';
      emptyCompleted.style.display = 'flex';
    });
  }

  // --- Mobile Navigation Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.mobile-navigation') || document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Открыть меню');
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        navLinks.classList.remove('mobile-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Открыть меню');
      }
    });
  }

  // --- Auth Modal (Войти) ---
  const loginBtns = document.querySelectorAll('.btn-login, [data-action="login"]');
  const authModal = document.getElementById('auth-modal');
  const closeModals = document.querySelectorAll('.modal-close, .modal-overlay');
  const loginForm = document.getElementById('login-form');

  loginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (authModal) {
        authModal.classList.add('active');
      }
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      authState = 'auth';
      updateAuthUI('auth');
      if (authModal) authModal.classList.remove('active');
      alert('Авторизация выполнена успешно! Вы вошли в аккаунт.');
    });
  }

  closeModals.forEach(closeEl => {
    closeEl.addEventListener('click', (e) => {
      if (e.target === closeEl || closeEl.classList.contains('modal-close')) {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });

  document.querySelectorAll('.modal-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // --- Header Search Bar Navigation ---
  const headerSearchInput = document.querySelector('.site-header .search-input');
  if (headerSearchInput) {
    headerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = headerSearchInput.value.trim();
        if (query) {
          const courseSearchInput = document.getElementById('course-search');
          if (courseSearchInput) {
            courseSearchInput.value = query;
            courseSearchInput.dispatchEvent(new Event('input'));
          } else {
            window.location.href = `courses.html?q=${encodeURIComponent(query)}`;
          }
        }
      }
    });
  }

  // ==================== COURSES PAGE: FILTERS, PRICING & SEARCH ====================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const priceFilterBtns = document.querySelectorAll('.price-filter-btn');
  const courseCards = document.querySelectorAll('.courses-grid-filterable .course-card');
  const courseSearchInput = document.getElementById('course-search');
  const countDisplay = document.getElementById('courses-count-text');

  if (courseCards.length > 0) {
    let activeFilter = 'all';
    let activePriceFilter = 'all';
    let searchQuery = '';

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (initialQuery && courseSearchInput) {
      courseSearchInput.value = initialQuery;
      searchQuery = initialQuery.toLowerCase();
    }

    function filterCourses() {
      let visibleCount = 0;

      courseCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const price = card.getAttribute('data-price') || 'free';
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

        const matchesCategory = (activeFilter === 'all' || category.includes(activeFilter));
        const matchesPrice = (activePriceFilter === 'all' || price === activePriceFilter);
        const matchesSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery);

        if (matchesCategory && matchesPrice && matchesSearch) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countDisplay) {
        if (visibleCount === 0) {
          countDisplay.textContent = 'Ничего не найдено по заданным фильтрам';
        } else if (visibleCount === 1) {
          countDisplay.textContent = '1 курс для твоего старта';
        } else if (visibleCount >= 2 && visibleCount <= 4) {
          countDisplay.textContent = `${visibleCount} курса для твоего старта`;
        } else {
          countDisplay.textContent = `${visibleCount} курсов для твоего старта`;
        }
      }
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        filterCourses();
      });
    });

    priceFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        priceFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePriceFilter = btn.getAttribute('data-price-filter') || 'all';
        filterCourses();
      });
    });

    if (courseSearchInput) {
      courseSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        filterCourses();
      });
    }

    filterCourses();
  }

  // --- Course Details Modal Handler ---
  const detailModal = document.getElementById('course-modal');
  const detailBtns = document.querySelectorAll('[data-course-details]');

  const courseData = {
    'python': {
      title: 'Python с нуля',
      level: 'Для начинающих',
      category: 'Программирование',
      duration: '4 месяца • 48 уроков',
      desc: 'Напиши первые программы и освой основы самого дружелюбного языка. Курс включает практические задачи, работу с переменными, структурами данных, функциями и объектно-ориентированным программированием.',
      syllabus: [
        'Синтаксис Python и переменные',
        'Условные конструкции и циклы',
        'Списки, словари и кортежи',
        'Функции и модули',
        'Финальный проект: Телеграм-бот'
      ]
    },
    'cpp': {
      title: 'Основы C++',
      level: 'Для начинающих',
      category: 'Программирование',
      duration: '5 месяцев • 60 уроков',
      desc: 'Разберись с переменными, циклами и функциями на языке C++. Глубокое понимание работы с памятью, указателями, ссылками и объектно-ориентированным дизайном.',
      syllabus: [
        'Базовый синтаксис и типы данных',
        'Управление потоком выполнения',
        'Указатели, ссылки и управление памятью',
        'Классы и структуры данных STL',
        'Курсовой проект: Консольная мини-игра'
      ]
    },
    'web': {
      title: 'Web-разработка',
      level: 'Для начинающих',
      category: 'Web-разработка',
      duration: '3 месяца • 36 уроков',
      desc: 'Создай свой первый сайт с помощью HTML, CSS и JavaScript. Научишься верстать адаптивные сайты и делать их живыми и интерактивными.',
      syllabus: [
        'Семантическая разметка HTML5',
        'Современный CSS3, Flexbox и CSS Grid',
        'Адаптивный дизайн для мобильных устройств',
        'Основы JavaScript и работа с DOM',
        'Публикация первого сайта в сети'
      ]
    },
    'algo': {
      title: 'Алгоритмы и структуры данных',
      level: 'Средний уровень',
      category: 'Программирование',
      duration: '3 месяца • 40 уроков',
      desc: 'Научись решать задачи и выбирать эффективные алгоритмы. Оценка сложности, сортировки, поиск, графы и динамическое программирование.',
      syllabus: [
        'Оценка сложности Big O',
        'Стеки, очереди и связанные списки',
        'Деревья и графы',
        'Жадные алгоритмы и динамическое программирование',
        'Подготовка к техническим собеседованиям'
      ]
    },
    'uiux': {
      title: 'UI/UX Дизайн',
      level: 'Для начинающих',
      category: 'Дизайн',
      duration: '3 месяца • 32 урока',
      desc: 'Изучи основы дизайна и создай удобные интерфейсы в Figma. Принципы композиции, типографика, цветовая теория и создание интерактивных кликабельных прототипов.',
      syllabus: [
        'Основы Figma и автолейауты',
        'Теория цвета и модульные сетки',
        'Дизайн-системы и компоненты',
        'UX-исследования и пользовательские сценарии',
        'Финальный кейс в портфолио на Behance'
      ]
    },
    'java': {
      title: 'Java для начинающих',
      level: 'Для начинающих',
      category: 'Программирование',
      duration: '4 месяца • 50 уроков',
      desc: 'Освой объектно-ориентированное программирование и создай приложение на одном из самых востребованных языков в enterprise-разработке.',
      syllabus: [
        'Основы синтаксиса Java',
        'Принципы ООП: инкапсуляция, наследование, полиморфизм',
        'Коллекции в Java',
        'Обработка исключений и потоки ввода/вывода',
        'Создание REST API на Spring Boot'
      ]
    },
    'frontend': {
      title: 'Frontend-разработка (React)',
      level: 'Средний уровень',
      category: 'Web-разработка',
      duration: '4 месяца • 45 уроков',
      desc: 'Разрабатывай современные интерактивные интерфейсы на JavaScript и React. Состояние, хуки, роутинг и взаимодействие с внешними API.',
      syllabus: [
        'Глубокий JavaScript ES6+',
        'Компонентная модель React',
        'React Hooks (useState, useEffect, custom hooks)',
        'Управление состоянием и роутинг',
        'Разработка SPA-приложения'
      ]
    },
    'datascience': {
      title: 'Data Science и Анализ данных',
      level: 'Средний уровень',
      category: 'Данные',
      duration: '5 месяцев • 55 уроков',
      desc: 'Анализируй данные с Python и познакомься с машинным обучением. Библиотеки Pandas, NumPy, Matplotlib и базовые модели машинного обучения Scikit-Learn.',
      syllabus: [
        'Python для анализа данных (Pandas, NumPy)',
        'Визуализация данных и разведочный анализ (EDA)',
        'Основы прикладной статистики',
        'Введение в Machine Learning (Scikit-Learn)',
        'Реальный проект анализа данных'
      ]
    },
    'git': {
      title: 'Git и GitHub',
      level: 'Для начинающих',
      category: 'Программирование',
      duration: '2 недели • 8 уроков',
      desc: 'Научись отслеживать изменения в проектах, работать с ветками и публиковать код на GitHub.',
      syllabus: [
        'Установка Git и настройка проекта',
        'Коммиты и история изменений',
        'Ветки и слияние изменений',
        'Работа с удалённым репозиторием GitHub'
      ]
    },
    'sql': {
      title: 'Основы SQL',
      level: 'Для начинающих',
      category: 'Данные',
      duration: '3 недели • 12 уроков',
      desc: 'Познакомься с реляционными базами данных и научись получать данные с помощью SQL-запросов.',
      syllabus: [
        'Таблицы и базовые SELECT-запросы',
        'Фильтрация, сортировка и группировка',
        'Объединение таблиц',
        'Создание и изменение таблиц'
      ]
    },
    'backend': {
      title: 'Backend на Node.js',
      level: 'Средний уровень',
      category: 'Web-разработка',
      duration: '4 месяца • 42 урока',
      desc: 'Создавай серверные приложения и API на Node.js, подключай базу данных и проверяй запросы.',
      syllabus: [
        'Основы Node.js и npm',
        'Создание API на Express',
        'Маршруты, middleware и обработка ошибок',
        'Работа с базой данных',
        'Подготовка и публикация backend-проекта'
      ]
    },
    'gamedev': {
      title: 'Разработка игр на Unity',
      level: 'Для начинающих',
      category: 'Программирование',
      duration: '4 месяца • 40 уроков',
      desc: 'Познакомься с Unity и C#, создай игровую сцену и собери первую небольшую 2D-игру.',
      syllabus: [
        'Интерфейс Unity и игровые объекты',
        'Основы C# для игр',
        'Управление персонажем и физика',
        'Интерфейс, звук и игровые события',
        'Сборка и презентация первой игры'
      ]
    }
  };

  detailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseKey = btn.getAttribute('data-course-details');
      const data = courseData[courseKey];

      if (detailModal && data) {
        document.getElementById('modal-course-title').textContent = data.title;
        document.getElementById('modal-course-desc').textContent = data.desc;
        document.getElementById('modal-course-level').textContent = data.level;
        document.getElementById('modal-course-category').textContent = data.category;
        document.getElementById('modal-course-duration').textContent = data.duration;

        const syllabusList = document.getElementById('modal-course-syllabus');
        if (syllabusList) {
          syllabusList.innerHTML = data.syllabus.map(item => `
            <li class="syllabus-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${item}</span>
            </li>
          `).join('');
        }

        detailModal.classList.add('active');
      }
    });
  });

  // --- Photo Banners Slider / Crossfade Animation ---
  function initPhotoBanner(bannerId) {
    const banner = document.getElementById(bannerId);
    if (!banner) return;

    const slides = banner.querySelectorAll('.photo-banner-slide');
    const dots = banner.querySelectorAll('.banner-dot-item');
    const prevBtn = banner.querySelector('.banner-prev');
    const nextBtn = banner.querySelector('.banner-next');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    let timer = null;

    function goToSlide(index) {
      slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 5000);
    }

    function stopAutoPlay() {
      if (timer) clearInterval(timer);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentIndex + 1);
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentIndex - 1);
        startAutoPlay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
        startAutoPlay();
      });
    });

    banner.addEventListener('mouseenter', stopAutoPlay);
    banner.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }

  initPhotoBanner('banner-students');
  initPhotoBanner('banner-workspace');

  // ==================== SCROLL REVEAL & EXIT ANIMATIONS ====================
  // Анимация плавного появления и ухода карточек при скролле (вверх и вниз)
  const animTargets = document.querySelectorAll(
    '.hero-content, .code-preview-wrap, .page-title-block, .section-header, .course-card, .track-card, .track-preview-card, .stat-card, .feature-card, .photo-banner-wrap, .about-hero-grid, .about-hero-img-wrap, .my-course-card, .my-courses-header-row, .profile-header-card, .activity-card, .review-card, .contact-card, .faq-item, .support-link-card, .support-detail-card, .payment-option-card, .support-contact-banner, .footer-left, .footer-links, .footer-bottom'
  );

  if ('IntersectionObserver' in window && animTargets.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // Плавно скрывается при скролле из зоны видимости (вверх или вниз)
          entry.target.classList.remove('is-visible');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    animTargets.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      const delayMod = (index % 4) + 1;
      el.classList.add(`reveal-delay-${delayMod}`);
      scrollObserver.observe(el);
    });
  } else if (animTargets.length > 0) {
    animTargets.forEach(el => el.classList.add('is-visible'));
  }

  // ==================== COOL FEATURE: CODE PLAYGROUND ====================
  const playgroundModal = document.getElementById('playground-modal');
  const playgroundTriggers = document.querySelectorAll('.btn-playground-trigger');
  const playgroundSelect = document.getElementById('playground-templates');
  const playgroundCode = document.getElementById('playground-code');
  const playgroundOutput = document.getElementById('playground-output');
  const playgroundRunBtn = document.getElementById('playground-run-btn');

  const codeSnippets = {
    'python_hello': `# Добро пожаловать в песочницу CodeStart!
name = "Будущий разработчик"
print(f"Привет, {name}!")
print("Твой путь в программирование начинается прямо сейчас 🚀")`,

    'python_fib': `# Вычисление чисел Фибоначчи
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("Первые 10 чисел Фибоначчи:")
print(fibonacci(10))`,

    'python_password': `# Генератор надежного пароля
import random
import string

chars = string.ascii_letters + string.digits + "!@#$%^&*"
password = "".join(random.choice(chars) for _ in range(12))
print("Сгенерированный пароль:", password)
print("Сложность: Высокая ⭐⭐⭐")`,

    'js_filter': `// Фильтрация и анализ данных (JavaScript)
const courses = [
  { name: "Python с нуля", students: 1250, rating: 4.9 },
  { name: "Web-разработка", students: 980, rating: 4.8 },
  { name: "Основы C++", students: 640, rating: 4.7 }
];

const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);
console.log("Всего активных студентов на платформе:", totalStudents);
console.log("Курсы с рейтингом выше 4.8:", courses.filter(c => c.rating >= 4.8).map(c => c.name));`
  };

  playgroundTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (playgroundModal) {
        playgroundModal.classList.add('active');
        if (playgroundSelect && playgroundCode) {
          playgroundCode.value = codeSnippets[playgroundSelect.value] || codeSnippets['python_hello'];
          if (playgroundOutput) playgroundOutput.textContent = 'Нажмите «Запустить код», чтобы увидеть результат...';
        }
      }
    });
  });

  if (playgroundSelect && playgroundCode) {
    playgroundSelect.addEventListener('change', () => {
      playgroundCode.value = codeSnippets[playgroundSelect.value] || '';
      if (playgroundOutput) playgroundOutput.textContent = 'Код готов к выполнению. Нажмите «Запустить код».';
    });
  }

  if (playgroundRunBtn && playgroundCode && playgroundOutput) {
    playgroundRunBtn.addEventListener('click', () => {
      playgroundOutput.textContent = 'Выполнение программы...';
      const startTime = performance.now();
      
      setTimeout(() => {
        const code = playgroundCode.value;
        const key = playgroundSelect ? playgroundSelect.value : '';
        const execTime = Math.round(performance.now() - startTime + 12);

        if (key.startsWith('js')) {
          try {
            let logs = [];
            const customConsole = {
              log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' '))
            };
            const runner = new Function('console', code);
            runner(customConsole);
            playgroundOutput.textContent = logs.join('\n') + `\n\n[Выполнено успешно за ${execTime}мс]`;
          } catch (err) {
            playgroundOutput.textContent = 'Ошибка выполнения: ' + err.message;
          }
        } else {
          if (key === 'python_hello') {
            playgroundOutput.textContent = `Привет, Будущий разработчик!\nТвой путь в программирование начинается прямо сейчас 🚀\n\n[Выполнено успешно за ${execTime}мс]`;
          } else if (key === 'python_fib') {
            playgroundOutput.textContent = `Первые 10 чисел Фибоначчи:\n[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n\n[Выполнено успешно за ${execTime}мс]`;
          } else if (key === 'python_password') {
            const sampleChars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
            let pwd = "";
            for (let i = 0; i < 12; i++) pwd += sampleChars[Math.floor(Math.random() * sampleChars.length)];
            playgroundOutput.textContent = `Сгенерированный пароль: ${pwd}\nСложность: Высокая ⭐⭐⭐\n\n[Выполнено успешно за ${execTime}мс]`;
          } else {
            const printMatches = [...code.matchAll(/print\((?:f?["'](.*?)["']|(.*?))\)/g)];
            if (printMatches.length > 0) {
              const outputLines = printMatches.map(m => m[1] || m[2]);
              playgroundOutput.textContent = outputLines.join('\n') + `\n\n[Выполнено успешно за ${execTime}мс]`;
            } else {
              playgroundOutput.textContent = `Код успешно скомпилирован и выполнен.\nПеременные и функции загружены в память.\n\n[Выполнено успешно за ${execTime}мс]`;
            }
          }
        }
      }, 200);
    });
  }
});

// Глобальная функция для открытия модального окна урока
window.openLessonModal = function(courseTitle, lessonTitle) {
  const lessonModal = document.getElementById('lesson-modal');
  const titleEl = document.getElementById('lesson-modal-title');
  const courseEl = document.getElementById('lesson-modal-course');

  if (lessonModal && titleEl && courseEl) {
    titleEl.textContent = lessonTitle;
    courseEl.textContent = `Курс: ${courseTitle}`;
    lessonModal.classList.add('active');
  }
};
