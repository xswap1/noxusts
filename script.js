document.addEventListener('DOMContentLoaded', () => {

    // --- Control del Preloader (Solo Palpitación, AHORA 1s) --- // MODIFICADO
    const preloader = document.getElementById('preloader');
    const preloaderLogo = document.getElementById('preloader-logo'); // Referencia al logo si es necesaria
    const body = document.body;
    let dollarInterval = null;

    // --- CONFIGURACIÓN DE TIEMPOS ---
    // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
    const FADEOUT_START_DELAY = 1000; // <-- CAMBIADO de 2000 a 1000 (1 segundo)
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    const preloaderFadeDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--preloader-fade-duration') || '0.8') * 1000;

    if (preloader) {
      // Asume que 'loading' class está en el HTML inicial
      window.onload = () => {
        console.log("Window loaded. Starting preloader sequence (1s - Palpitate Only)."); // Mensaje actualizado

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

        }, FADEOUT_START_DELAY); // Espera AHORA 1 segundo
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
      // Close menu when a link is clicked
      navLinks.forEach(link => {
          link.addEventListener('click', () => {
              if (mainNav.classList.contains('is-active')) {
                  mainNav.classList.remove('is-active');
                  menuToggle.innerHTML = '☰';
                  menuToggle.setAttribute('aria-label', 'Abrir menú');
              }
              // Smooth scroll logic might already be handled by CSS scroll-behavior
              // Or could be added here if needed
          });
      });
    }

    // --- Resaltar Enlace Activo ---
    const sections = document.querySelectorAll('section[id]');
    const mainHeader = document.getElementById('main-header');
    // Make sure headerHeight is calculated correctly, considering potential CSS vars
    const headerHeight = mainHeader ? mainHeader.offsetHeight : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '70', 10);

    function setActiveLink() {
      let currentSectionId = '';
      // Adjusted scroll position calculation for better accuracy
      const scrollThreshold = window.pageYOffset + headerHeight + 50; // 50px buffer

      sections.forEach(section => {
        if(section && typeof section.offsetTop !== 'undefined' && typeof section.offsetHeight !== 'undefined') {
           const sectionTop = section.offsetTop;
           const sectionHeight = section.offsetHeight;
           // Check if the scroll position is within the section boundaries
           if (scrollThreshold >= sectionTop && scrollThreshold < sectionTop + sectionHeight) {
              currentSectionId = section.getAttribute('id');
           }
        }
      });

      // Special case for top of the page
      if (window.pageYOffset <= headerHeight) {
         // Check if the first section is visible enough
         const firstSection = sections[0];
         if (firstSection && window.pageYOffset < firstSection.offsetTop + firstSection.offsetHeight / 2) {
            currentSectionId = 'inicio'; // Or derive from first section ID if not 'inicio'
         }
      }
      // Special case for bottom of the page
      if ((window.innerHeight + Math.ceil(window.pageYOffset)) >= document.body.offsetHeight - 50) { // 50px buffer from bottom
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
            currentSectionId = lastSection.getAttribute('id');
        }
      }

      const mainNavLinks = document.querySelectorAll('.main-nav ul li a');
      mainNavLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        // Match link href with currentSectionId, ensure href starts with #
        if (linkHref && linkHref.startsWith('#') && linkHref.substring(1) === currentSectionId) {
            link.classList.add('active');
        } else if (currentSectionId === 'inicio' && linkHref === '#inicio') { // Handle #inicio specifically
            link.classList.add('active');
        }
      });
    }
    window.addEventListener('load', setActiveLink);
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', setActiveLink, { passive: true });


    // --- Animación H1 ---
    const heroTitle = document.getElementById('hero-title');
    let scrollHandlerH1 = null;
    if (heroTitle) {
      const triggerPoint = 150; // Pixels from top
      const handleScrollAnimation = () => {
        // Ensure element still exists
        if (!document.body.contains(heroTitle)) {
            if (scrollHandlerH1) window.removeEventListener('scroll', scrollHandlerH1);
            return;
        }
        const titleRect = heroTitle.getBoundingClientRect();
        const titleTop = titleRect.top; // Position relative to viewport top

        if (titleTop < triggerPoint && !heroTitle.classList.contains('animate-out')) {
            heroTitle.classList.add('animate-out');
        } else if (titleTop >= triggerPoint && heroTitle.classList.contains('animate-out')) {
            // Option to re-animate when scrolling back up
             heroTitle.classList.remove('animate-out');
        }
      };
      let tickingH1 = false;
      scrollHandlerH1 = () => {
         if (!tickingH1) {
             window.requestAnimationFrame(() => {
                 handleScrollAnimation();
                 tickingH1 = false;
             });
             tickingH1 = true;
         }
      };
      window.addEventListener('scroll', scrollHandlerH1, { passive: true });
      handleScrollAnimation(); // Initial check
    }


    // --- Lluvia de Dólares ---
    function createDollarSign() {
      if (!document.body) return; // Ensure body exists

      const dollar = document.createElement('span');
      dollar.classList.add('dollar-sign');
      dollar.textContent = '$';
      dollar.style.left = `${Math.random() * 98}vw`; // Use vw for responsiveness
      dollar.style.animationDuration = `${Math.random() * 4 + 4}s`; // Random duration between 4s and 8s

      // Get colors from CSS variables safely
      const rootStyles = getComputedStyle(document.documentElement);
      const akatsukiRed = rootStyles.getPropertyValue('--akatsuki-red').trim() || '#CC0000';
      const akatsukiLightGray = rootStyles.getPropertyValue('--akatsuki-light-gray').trim() || '#CCCCCC';

      dollar.style.color = Math.random() > 0.4 ? akatsukiRed : akatsukiLightGray;
      document.body.appendChild(dollar);

      // Use 'animationend' event for cleanup
      dollar.addEventListener('animationend', () => {
          // Check if the element is still parented before removing
          if (dollar.parentNode === document.body) {
               document.body.removeChild(dollar);
          }
      }, { once: true }); // Use once: true for automatic listener removal
    }
    function startDollarRain() {
       // Avoid starting multiple intervals
       if (!dollarInterval && document.body) {
           dollarInterval = setInterval(createDollarSign, 300); // Create one every 300ms
           console.log("Dollar rain started.");
       } else if (dollarInterval) {
           console.log("Dollar rain already running.");
       } else {
           console.warn("Cannot start dollar rain, body not ready yet.");
       }
    }

    // ================================================
    // --- Lógica para el texto desplazable ---
    // ================================================
    const scrollingTextContainer = document.querySelector('.scrolling-text-container');
    const scrollingText = document.querySelector('.scrolling-text');

    if (scrollingTextContainer && scrollingText) {
      let tickingScrollText = false;
      const handleScrollText = () => {
        const rect = scrollingTextContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Define start and end points relative to viewport
        const start = viewportHeight; // Start animating when top hits bottom of viewport
        const end = -rect.height; // Stop animating when bottom hits top of viewport

        let progress = 0;
        if (rect.top < start && rect.bottom > 0) { // Check if element is roughly in view
            // Calculate progress based on how much of the element has passed the 'start' point
            // This makes the animation smoother within the viewable scroll range
            progress = (start - rect.top) / (start - end + rect.height); // Normalize progress
        } else if (rect.bottom <= 0) { // Element fully scrolled past top
          progress = 1;
        } else if (rect.top >= start) { // Element not yet reached bottom
            progress = 0;
        }

        progress = Math.max(0, Math.min(1, progress)); // Clamp progress between 0 and 1

        // Adjust total movement distance as needed
        const totalMovePixels = -500; // How far it moves in total
        let currentTranslateX = totalMovePixels * progress;

        // Apply transform using requestAnimationFrame for smoothness
        scrollingText.style.transform = `translateX(${currentTranslateX}px)`;
        tickingScrollText = false; // Allow next frame request
      };

      window.addEventListener('scroll', () => {
        if (!tickingScrollText) {
          window.requestAnimationFrame(handleScrollText);
          tickingScrollText = true;
        }
      }, { passive: true }); // Use passive listener

      // Initial calculation on load might be needed if starting position matters
      setTimeout(handleScrollText, 100); // Small delay after load
    }
    // --- Fin lógica texto desplazable ---


    // --- Intersection Observer para Animaciones de Scroll (ACTUALIZADO) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animated-component');

    if (animatedElements.length > 0) {
       const observerOptions = {
           root: null, // Relative to viewport
           rootMargin: '0px 0px -100px 0px', // Trigger 100px before entering viewport bottom
           threshold: 0.1 // 10% visible needed to trigger
       };

       const observerCallback = (entries, observer) => {
           entries.forEach(entry => {
               // Ignore specific elements if needed
               if (entry.target.classList.contains('scrolling-text-container')) {
                   return;
               }

               if (entry.isIntersecting) {
                   entry.target.classList.add('in-view');
                   // Optional: Stop observing after first animation
                   // observer.unobserve(entry.target);
               } else {
                   // Only reset animation for team cards if they leave viewport
                   if (entry.target.classList.contains('team-member-card')) {
                       entry.target.classList.remove('in-view');
                   }
                   // For others (.animated-component), we don't remove 'in-view' by default
                   // to prevent re-animation on scroll up/down unless specifically desired.
               }
           });
       };

       const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
       animatedElements.forEach(element => intersectionObserver.observe(element));
       console.log(`Intersection Observer watching ${animatedElements.length} animated elements.`);
    } else {
       console.warn("No elements found with '.animate-on-scroll' or '.animated-component' class.");
    }
    // --- Fin Intersection Observer ---


    // --- ================================================
    // --- Lógica para la sección FAQ Plegable ---
    // ================================================
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
      faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer'); // Get answer element

        if (questionButton && answer) {
          questionButton.addEventListener('click', () => {
            const isCurrentlyActive = item.classList.contains('active');

            // --- Optional: Accordion Mode (Close others) ---
            // faqItems.forEach(otherItem => {
            //   if (otherItem !== item && otherItem.classList.contains('active')) {
            //     otherItem.classList.remove('active');
            //     otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            //   }
            // });
            // --- End Optional Accordion Mode ---

            // Toggle the current item
            item.classList.toggle('active');
            const isNowActive = item.classList.contains('active');

            // Set ARIA attribute for accessibility
            questionButton.setAttribute('aria-expanded', isNowActive);

          });
        } else {
             console.warn("Could not find '.faq-question' button or '.faq-answer' div inside an '.faq-item'");
        }
      });
       console.log(`Initialized ${faqItems.length} FAQ items.`);
    } else {
         console.log("No FAQ items found with class '.faq-item'");
    }
    // --- Fin Lógica FAQ ---


    // --- ================================================
    // --- NUEVA LÓGICA: Generador de Enlace de Referido ---
    // --- ================================================
    const referralIdentifierInput = document.getElementById('referral-identifier-input');
    const generateButton = document.getElementById('generate-referral-link-btn');
    const referralOutputArea = document.getElementById('referral-link-output');

    if (referralIdentifierInput && generateButton && referralOutputArea) {

        // !!! MUY IMPORTANTE: REEMPLAZA ESTA URL DE EJEMPLO !!!
        // Debes reemplazarla con la URL que obtengas al desplegar tu Google Apps Script como Web App.
        const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbylxjvSMWq1_3gVlRiIV92mSeW0VxPRVt2_OX7fpmO1F-zLkaWUvtM32CCs5MNdsR6R/exec'; // ¡URL de ejemplo!

        generateButton.addEventListener('click', async () => {
            const identifier = referralIdentifierInput.value.trim();

            // Validación simple: no enviar si está vacío
            if (!identifier) {
                referralOutputArea.innerHTML = `<p>Please enter your Discord Username or Wallet Address.</p>`;
                referralOutputArea.className = 'referral-output-area has-error'; // Reset classes and add error
                return;
            }

            // --- Estado de Carga ---
            generateButton.disabled = true; // Deshabilitar botón
            referralOutputArea.innerHTML = `<p>Generating your link...</p>`;
            referralOutputArea.className = 'referral-output-area is-loading'; // Clase de carga

            try {
                console.log(`Sending identifier "${identifier}" to Apps Script...`);

                // Enviar datos al Google Apps Script usando fetch (método POST es común para enviar datos)
                const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
                    method: 'POST',
                    // mode: 'no-cors', // OJO: 'no-cors' puede ser necesario si Apps Script no maneja CORS, pero limita la respuesta que puedes leer. La configuración ideal es que Apps Script maneje CORS correctamente.
                    headers: {
                        'Content-Type': 'application/json',
                        // Puede que necesites otros headers dependiendo de tu Apps Script
                    },
                    body: JSON.stringify({ identifier: identifier }) // Enviar el identificador como JSON
                });

                // Verificar si la respuesta de la red fue exitosa (status 2xx)
                if (!response.ok) {
                    // Intentar leer el cuerpo del error si es posible (si no usaste 'no-cors')
                    let errorText = `Error generating link. Status: ${response.status}`;
                    try {
                       const errorData = await response.json();
                       errorText = errorData.message || errorData.error || errorText;
                    } catch (e) { /* No se pudo parsear JSON de error, usar texto de status */ }

                    throw new Error(errorText);
                }

                // Asumiendo que el Apps Script devuelve JSON: { success: true, link: "..." } o { success: false, message: "..." }
                const result = await response.json();
                console.log("Response from Apps Script:", result);

                if (result.success && result.link) {
                    // --- Estado Éxito ---
                    referralOutputArea.innerHTML = `<p>Your link: ${result.link}</p>`; // Mostrar el link
                    referralOutputArea.className = 'referral-output-area has-link'; // Clase de éxito
                } else {
                    // --- Estado Error (Respuesta del Script) ---
                    throw new Error(result.message || 'Failed to generate link. Please try again.');
                }

            } catch (error) {
                // --- Estado Error (Red o Lógica) ---
                console.error("Error during referral link generation:", error);
                referralOutputArea.innerHTML = `<p>Error: ${error.message || 'Could not generate link.'}</p>`;
                referralOutputArea.className = 'referral-output-area has-error'; // Clase de error

            } finally {
                // --- Limpieza (siempre se ejecuta) ---
                generateButton.disabled = false; // Rehabilitar botón
            }
        });

        console.log("Referral link generator initialized.");

    } else {
        console.warn("Referral section elements not found (input, button, or output area).");
    }
    // --- Fin Lógica Referidos ---

}); // Fin del DOMContentLoaded