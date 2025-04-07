document.addEventListener('DOMContentLoaded', () => {

  // --- Control del Preloader (Solo Palpitación, 6.5s) ---
  const preloader = document.getElementById('preloader');
  const preloaderLogo = document.getElementById('preloader-logo'); // Referencia al logo si es necesaria
  const body = document.body;
  let dollarInterval = null;

  // --- CONFIGURACIÓN DE TIEMPOS ---
  const FADEOUT_START_DELAY = 6500; // 6.5 segundos visibles antes de empezar a ocultar
  const preloaderFadeDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--preloader-fade-duration') || '0.8') * 1000;

  if (preloader) {
    // Asume que 'loading' class está en el HTML inicial
    window.onload = () => {
      console.log("Window loaded. Starting preloader sequence (6.5s - Palpitate Only).");

      // Iniciar el desvanecimiento del preloader después del delay TOTAL configurado
      setTimeout(() => {
        if(preloader) {
          console.log("Starting preloader fade out.");
          preloader.classList.add('loaded'); // Añade clase para iniciar transición CSS
          body.classList.remove('loading'); // Permite scroll
        }
        // Inicia la lluvia de dólares AHORA
        startDollarRain();

        // Elimina el elemento preloader del DOM DESPUÉS de que termine la transición
        if (preloader) {
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                    console.log("Preloader removed from DOM.");
                }
            }, preloaderFadeDuration);
        }

      }, FADEOUT_START_DELAY); // Espera 6.5 segundos
    };
  } else {
     console.warn("Preloader element not found.");
     body.classList.remove('loading');
     startDollarRain(); // Inicia lluvia si no hay preloader
  }


  // --- Inicializar tsParticles ---
  if (typeof tsParticles !== 'undefined') {
      tsParticles.load("tsparticles", {
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
              number: { value: 60, density: { enable: true, value_area: 800 } },
              color: { value: ["#CCCCCC", "#CC0000"] }, // Gris y Rojo
              shape: { type: "circle" },
              opacity: { value: {min: 0.3, max: 0.8} , animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false } },
              size: { value: { min: 1, max: 3 } },
              move: {
                  enable: true, speed: 0.5, direction: "none", random: true,
                  straight: false, out_mode: "out", bounce: false,
              }
          },
          interactivity: { detectsOn: "canvas", events: { onHover: { enable: false }, onClick: { enable: false }, resize: true } },
          detectRetina: true
      }).then(container => {
          console.log("tsParticles initialized"); // Confirmación
      }).catch(error => {
          console.error("tsParticles initialization error:", error);
      });
  } else {
      console.error("tsParticles library not loaded.");
  }


  // --- Menú Móvil ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.main-nav ul li a');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('is-active');
        menuToggle.innerHTML = mainNav.classList.contains('is-active') ? '&times;' : '☰';
        menuToggle.setAttribute('aria-label', mainNav.classList.contains('is-active') ? 'Cerrar menú' : 'Abrir menú');
    });
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-active')) {
                mainNav.classList.remove('is-active'); menuToggle.innerHTML = '☰';
                menuToggle.setAttribute('aria-label', 'Abrir menú');
            }
        });
    });
  }

  // --- Resaltar Enlace Activo ---
  // Selecciona TODAS las secciones con ID, incluyendo la nueva sección #team
  const sections = document.querySelectorAll('section[id]');
  const mainHeader = document.getElementById('main-header');
  const headerHeight = mainHeader ? mainHeader.offsetHeight : 70;
  function setActiveLink() {
    let currentSectionId = '';
    // Ajuste para detectar mejor la sección visible, especialmente las más cortas
    const scrollPosition = window.pageYOffset + headerHeight + window.innerHeight * 0.4; // Punto de detección más abajo
    sections.forEach(section => {
      if(section && typeof section.offsetTop !== 'undefined' && typeof section.offsetHeight !== 'undefined') {
         const sectionTop = section.offsetTop;
         const sectionBottom = sectionTop + section.offsetHeight;
         // Considera una sección como activa si el punto de scroll está dentro de ella
         if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
             currentSectionId = section.getAttribute('id');
         }
      }
    });
    // Casos borde: muy arriba o muy abajo
    if (window.pageYOffset < headerHeight) { currentSectionId = 'inicio'; }
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
      if (sections.length > 0) {
         const lastSection = sections[sections.length - 1];
         if (lastSection) {
            // Asegúrate de que la última sección esté realmente visible
            const lastSectionTop = lastSection.offsetTop;
            if (scrollPosition >= lastSectionTop) {
                currentSectionId = lastSection.getAttribute('id');
            }
         }
      }
    }
    const mainNavLinks = document.querySelectorAll('.main-nav ul li a');
    mainNavLinks.forEach(link => {
      link.classList.remove('active');
      // Comprueba si el href del link coincide con el ID de la sección actual
      if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
      }
    });
  }
  window.addEventListener('load', setActiveLink);
  window.addEventListener('scroll', setActiveLink); // Considera usar requestAnimationFrame si hay problemas de rendimiento


  // --- Animación H1 ---
  const heroTitle = document.getElementById('hero-title');
  let scrollHandlerH1 = null;
  if (heroTitle) {
    const triggerPoint = 150;
    const handleScrollAnimation = () => {
      if (!document.body.contains(heroTitle)) { if(scrollHandlerH1) window.removeEventListener('scroll', scrollHandlerH1); return; }
      const titleRect = heroTitle.getBoundingClientRect(); const titleTop = titleRect.top;
      if (titleTop < triggerPoint && !heroTitle.classList.contains('animate-out')) { heroTitle.classList.add('animate-out'); }
      else if (titleTop >= triggerPoint && heroTitle.classList.contains('animate-out')) { heroTitle.classList.remove('animate-out'); }
    };
    let tickingH1 = false; // Renombrado para evitar conflicto
    scrollHandlerH1 = () => {
       if (!tickingH1) { window.requestAnimationFrame(() => { handleScrollAnimation(); tickingH1 = false; }); tickingH1 = true; }
    };
    window.addEventListener('scroll', scrollHandlerH1);
    handleScrollAnimation(); // Ejecuta al cargar
  }


  // --- Lluvia de Dólares ---
  function createDollarSign() {
    const dollar = document.createElement('span'); dollar.classList.add('dollar-sign'); dollar.textContent = '$';
    dollar.style.left = `${Math.random() * 98}vw`;
    dollar.style.animationDuration = `${Math.random() * 4 + 4}s`;
    const akatsukiRed = getComputedStyle(document.documentElement).getPropertyValue('--akatsuki-red').trim() || '#CC0000';
    const akatsukiLightGray = getComputedStyle(document.documentElement).getPropertyValue('--akatsuki-light-gray').trim() || '#CCCCCC';
    dollar.style.color = Math.random() > 0.4 ? akatsukiRed : akatsukiLightGray;
    // Asegurarse de que el body existe antes de añadir el elemento
    if (document.body) {
        document.body.appendChild(dollar);
        dollar.addEventListener('animationend', () => {
            // Comprobar de nuevo si el body y el padre existen antes de remover
            if (dollar.parentNode === document.body) {
                 document.body.removeChild(dollar);
            }
        }, { once: true });
    }
  }
  function startDollarRain() {
     // Solo inicia si no está ya corriendo y si el body existe
     if (!dollarInterval && document.body) {
         dollarInterval = setInterval(createDollarSign, 300);
         console.log("Dollar rain started.");
     } else if (dollarInterval) {
         console.log("Dollar rain already running or body not ready yet.");
     }
  }


  // --- Intersection Observer para Animaciones de Scroll ---
  // Selecciona TODOS los elementos que deben animarse al hacer scroll
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  if (animatedElements.length > 0) {
      const observerOptions = {
          root: null, // Observa la intersección con el viewport
          rootMargin: '0px', // Sin margen adicional
          threshold: 0.15 // El elemento debe estar visible al menos en un 15%
      };
      const observerCallback = (entries, observer) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('in-view');
                  // Opcional: Descomentar si solo quieres que la animación ocurra una vez
                  // observer.unobserve(entry.target);
              } else {
                  // Opcional: Comentar o eliminar si quieres que la animación se repita al salir y volver a entrar
                  // entry.target.classList.remove('in-view');
              }
          });
      };
      const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
      // Observa cada elemento que debe ser animado
      animatedElements.forEach(element => {
          intersectionObserver.observe(element);
      });
      console.log(`Intersection Observer watching ${animatedElements.length} elements.`);
  } else {
      console.warn("No elements found with '.animate-on-scroll' class.");
  }

}); // Fin del DOMContentLoaded