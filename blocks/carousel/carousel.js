import { fetchPlaceholders, createOptimizedPicture } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
  
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

async function fetchJson(link) {
  const response = await fetch(link?.href);
  if (response.ok) {
	const jsonData = await response.json();
	const data = jsonData?.data;
	return data;
  }
	return 'an error occurred';
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  const isJSONCarousel = block.classList.contains('is-json');

  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = isJSONCarousel.length < 2 && rows.length < 2;
  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  if(isJSONCarousel){  
	const link = block.querySelector('a');
  	const cardData = await fetchJson(link);
	cardData.forEach((card, idx) => {

		// handles images being brought in from scene7 links
		function jsx(html, ...args) {
			return html.slice(1).reduce((str, elem, i) => str + args[i] + elem, html[0]);
		}
		const picture = document.createElement('picture')
		
		picture.innerHTML = jsx`
			<source type="image/webp" srcset="${card.s7image}?$rfk_medium$">
			<img class="s7" loading="lazy" alt="${card.title}" src="${card.s7image}?$rfk_medium$">
		`;
		// // //
		  
		const createdSlide = document.createElement('li');
		createdSlide.dataset.slideIndex = idx;
		createdSlide.setAttribute('id', `carousel-${carouselId}-slide-${idx}`);
		createdSlide.classList.add('carousel-slide');
		
		if(card.bestSeller === 'true'){
			createdSlide.innerHTML = `
			<div class="slide-image">
			${picture.outerHTML}
			<span>
				${card.bestSeller === 'true' ? 'best seller' : ''}
			</span>
			</div>
			<div class="slide-content">
			<h5>${card.title}</h5>
			<p><span>${card.nowPrice}</span> <span class="strokethrough">${card.discountedPrice}</span> (original ${card.originalPrice})</p>
			<p class="percent">Extra ${card.percentOff}% Off. Price as Marked</p>
			</div>`
	  	} else {		
			createdSlide.innerHTML = `
			<div class="slide-image">
				${picture.outerHTML}
			</div>
			<div class="slide-content">
				<h5>${card.title}</h5>
				<p><span>${card.nowPrice}</span> <span class="strokethrough">${card.discountedPrice}</span> (original ${card.originalPrice})</p>
				<p class="percent">Extra ${card.percentOff}% Off. Price as Marked</p>
			</div>`
		}

		const labeledBy = createdSlide.querySelector('h1, h2, h3, h4, h5, h6');
		if (labeledBy) {
			createdSlide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
		}

		slidesWrapper.append(createdSlide);

		if (slideIndicators) {
			const indicator = document.createElement('li');
			indicator.classList.add('carousel-slide-indicator');
			indicator.dataset.targetSlide = idx;
			indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${cardData.length}</span></button>`;
			slideIndicators.append(indicator);
		}
	})
  } else {
	rows.forEach((row, idx) => {
		const slide = createSlide(row, idx, carouselId);
		slidesWrapper.append(slide);

		if (slideIndicators) {
		const indicator = document.createElement('li');
		indicator.classList.add('carousel-slide-indicator');
		indicator.dataset.targetSlide = idx;
		indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
		slideIndicators.append(indicator);
		}
		row.remove();
	});
  }
  container.append(slidesWrapper);
  block.prepend(container);

  if(!isSingleSlide) {
    bindEvents(block);
  }
}