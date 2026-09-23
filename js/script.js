/* =============================================================
   FreshAir Home Services — script.js
   1. Sticky navbar shadow on scroll
   2. Mobile hamburger menu
   3. Active nav link on scroll
   4. Smooth-scroll offset handling (native CSS handles the scroll)
   5. Testimonial slider
   6. FAQ accordion
   7. Contact form validation + simulated submission
   8. Scroll-to-top button
   9. Section reveal animation
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Sticky navbar shadow ---------- */
  var header = document.getElementById('siteHeader');
  function updateHeaderShadow() {
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeaderShadow();
  window.addEventListener('scroll', updateHeaderShadow);

  /* ---------- 2. Mobile hamburger menu ---------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  function closeMenu() {
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    var isOpen = primaryNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  navToggle.addEventListener('click', toggleMenu);

  // Close mobile menu when a nav link is clicked
  var navLinks = primaryNav.querySelectorAll('a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close mobile menu if window is resized back to desktop width
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });

  /* ---------- 3. Active nav link on scroll ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinkMap = {};
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.charAt(0) === '#') {
      navLinkMap[href.slice(1)] = link;
    }
  });

  function updateActiveNavLink() {
    var scrollPos = window.scrollY + 120;
    var currentId = null;
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });
    Object.keys(navLinkMap).forEach(function (id) {
      navLinkMap[id].classList.toggle('is-active', id === currentId);
    });
  }
  updateActiveNavLink();
  window.addEventListener('scroll', updateActiveNavLink);

  /* ---------- 5. Testimonial slider ---------- */
  var track = document.getElementById('testimonialTrack');
  var slides = track ? Array.from(track.children) : [];
  var dotsContainer = document.getElementById('sliderDots');
  var prevBtn = document.getElementById('prevTestimonial');
  var nextBtn = document.getElementById('nextTestimonial');
  var currentSlide = 0;
  var autoplayTimer = null;

  function buildDots() {
    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Show testimonial ' + (index + 1));
      dot.addEventListener('click', function () {
        goToSlide(index);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    var dots = dotsContainer.querySelectorAll('button');
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === currentSlide);
    });
  }

  function goToSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    updateDots();
  }

  function startAutoplay() {
    autoplayTimer = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, 6000);
  }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  if (track && slides.length) {
    buildDots();
    goToSlide(0);
    startAutoplay();

    nextBtn.addEventListener('click', function () {
      goToSlide(currentSlide + 1);
      restartAutoplay();
    });
    prevBtn.addEventListener('click', function () {
      goToSlide(currentSlide - 1);
      restartAutoplay();
    });

    // Pause autoplay when the slider is not visible / hovered
    var sliderWrap = document.getElementById('testimonialSlider');
    sliderWrap.addEventListener('mouseenter', function () { clearInterval(autoplayTimer); });
    sliderWrap.addEventListener('mouseleave', startAutoplay);
  }

  /* ---------- 6. FAQ accordion ---------- */
  var accordionTriggers = document.querySelectorAll('.accordion-trigger');
  accordionTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));

      // Close all other panels for a classic single-open accordion
      accordionTriggers.forEach(function (otherTrigger) {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          var otherPanel = document.getElementById(otherTrigger.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  /* ---------- 7. Contact form validation + simulated submission ---------- */
  var form = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');

  var fieldValidators = {
    name: function (value) {
      return value.trim().length >= 2 ? '' : 'Please enter your full name.';
    },
    email: function (value) {
      var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) return 'Please enter your email address.';
      return pattern.test(value.trim()) ? '' : 'Please enter a valid email address.';
    },
    phone: function (value) {
      var digits = value.replace(/\D/g, '');
      if (!value.trim()) return 'Please enter your phone number.';
      return digits.length >= 7 ? '' : 'Please enter a valid phone number.';
    },
    service: function (value) {
      return value ? '' : 'Please select the service you need.';
    },
    message: function (value) {
      return value.trim().length >= 10 ? '' : 'Please add a few details (at least 10 characters).';
    }
  };

  function showFieldError(fieldName, message) {
    var input = document.getElementById(fieldName);
    var errorEl = document.getElementById(fieldName + 'Error');
    var row = input.closest('.form-row');
    if (message) {
      row.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      row.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function validateField(fieldName) {
    var input = document.getElementById(fieldName);
    var message = fieldValidators[fieldName](input.value);
    showFieldError(fieldName, message);
    return message === '';
  }

  // Live validation as the user leaves a field
  Object.keys(fieldValidators).forEach(function (fieldName) {
    var input = document.getElementById(fieldName);
    input.addEventListener('blur', function () { validateField(fieldName); });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var isFormValid = true;
    Object.keys(fieldValidators).forEach(function (fieldName) {
      var valid = validateField(fieldName);
      if (!valid) isFormValid = false;
    });

    formStatus.hidden = false;

    if (!isFormValid) {
      formStatus.textContent = 'Please fix the highlighted fields and try again.';
      formStatus.className = 'form-status is-error';
      var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    // No backend is connected — simulate a successful submission.
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    setTimeout(function () {
      formStatus.textContent = 'Thanks! Your request has been received — we will call you back shortly to confirm a visit time.';
      formStatus.className = 'form-status is-success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 900);
  });

  /* ---------- 8. Scroll-to-top button ---------- */
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      scrollTopBtn.hidden = false;
    } else {
      scrollTopBtn.hidden = true;
    }
  });
  scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 9. Section reveal animation ---------- */
  var revealTargets = document.querySelectorAll('.section-head, .service-card, .why-item, .step, .card');
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything immediately if IntersectionObserver is unsupported
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

});
