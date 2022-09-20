'use strict';

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;
const allSections = document.querySelectorAll('.section');
const imgTargets = document.querySelectorAll('img[data-src]');
const slides = document.querySelectorAll('.slide');
const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');
const slider = document.querySelector('.slider');

const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));
btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Smooth scrolling
btnScrollTo.addEventListener('click', function (e) {
  section1.scrollIntoView({ behavior: 'smooth' });
});

// Smooth scrolling for nav/page links
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

// Tapped component

tabsContainer.addEventListener('click', function (e) {
  e.preventDefault();

  // Assuring target is a button element even child element in clicked
  const clicked = e.target.closest('.operations__tab');

  // Guard clause
  if (!clicked) return;

  // Remove current active tab
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(t => t.classList.remove('operations__content--active'));

  // Activate tab
  clicked.classList.add('operations__tab--active');

  // Activate content area
  tabsContent[clicked.dataset.tab - 1].classList.add(
    'operations__content--active'
  );

  // OR
  // document
  //   .querySelector(`.operations__content--${clicked.dataset.tab}`)
  //   .classList.add('operations__content--active');
});

// Menu fade animation
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });

    logo.style.opacity = this;
  }
};

nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

// Sticky Nav
// with scroll event it is performance inefficient specially on mobiles

// Intersection Observer API
const stickyNav = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  // root is the element the target intersecting
  root: null, // null means entire viewport
  // threshold is percentage of intersection on which the callback function will be called
  threshold: 0, // when nothing is shown
  // root margin a box that will applied outside/inside the target element
  rootMargin: `-${navHeight}px`, // has to pixels
});

headerObserver.observe(header);

// Reveal elements on scroll

const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(section => {
  sectionObserver.observe(section);
  // section.classList.add('section--hidden');
});

// Lazy loading images
// It is good for performance
// we load small low resolution image first and on scroll replace it with original

const loadImg = (entries, observer) => {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  entry.target.src = entry.target.dataset.src;

  // to remove blur on loading
  entry.target.addEventListener('load', () => {
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
});

imgTargets.forEach(img => imgObserver.observe(img));

// Slider component
let currentSlide = 0;
let sliderInView = false;

const initSlider = () => {
  createDots();
  goToSlide(currentSlide);
};

// Dots function
const dots = document.querySelector('.dots');
const createDots = () => {
  slides.forEach((_, i) => {
    dots.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${i + 1}"></button>`
    );
  });
};

// Setting initial locations by percentages
const goToSlide = slide => {
  slides.forEach((s, i) => {
    s.style.transform = `translateX(${(i - slide) * 100}%)`;
  });

  document
    .querySelectorAll('.dots__dot')
    .forEach(dot => dot.classList.remove('dots__dot--active'));

  document
    .querySelector(`.dots__dot[data-slide="${slide + 1}"]`)
    .classList.add('dots__dot--active');
};

// Next slide
const nextSlide = () => {
  currentSlide = ++currentSlide % slides.length;
  goToSlide(currentSlide);
};

// Prev slide
const prevSlide = () => {
  currentSlide = currentSlide - 1 < 0 ? slides.length - 1 : --currentSlide;
  goToSlide(currentSlide);
};

btnRight.addEventListener('click', nextSlide);
btnLeft.addEventListener('click', prevSlide);

// Handle arrow key press
// Observer to allow keys to function when slider is in view0
const sliderObserver = new IntersectionObserver(
  entries => {
    const [entry] = entries;
    sliderInView = entry.isIntersecting;
  },
  {
    root: null,
    threshold: 0,
  }
);

sliderObserver.observe(slider);

document.addEventListener('keydown', e => {
  if (!sliderInView) return;
  e.key === 'ArrowLeft' && prevSlide();
  e.key === 'ArrowRight' && nextSlide();
});

// Implementing dots
dots.addEventListener('click', e => {
  // Matching
  if (e.target.classList.contains('dots__dot')) {
    const { slide } = e.target.dataset;
    currentSlide = slide - 1;
    goToSlide(currentSlide);
  }
});

initSlider();
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
