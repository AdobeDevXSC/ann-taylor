import { fetchPlaceholders, createOptimizedPicture } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.curalate-carousel');
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


	const link = block.querySelector('a');
  	const slideData = await fetchJson(link);

	slideData.forEach((slide, idx) => {
		const slideProductsData = [
				// 1
				{
					'title': slide.title1,
					'image': slide.image1,
					'price': slide.price1,
					'salePrice': slide.salePrice1,
				},
				// 2
				{
					'title': slide.title2,
					'image': slide.image2,
					'price': slide.price2,
					'salePrice': slide.salePrice2,
				},
				// 3
				{
					'title': slide.title3,
					'image': slide.image3,
					'price': slide.price3,
					'salePrice': slide.salePrice3,
				},
				// 4
				{
					'title': slide.title4,
					'image': slide.image4,
					'price': slide.price4,
					'salePrice': slide.salePrice4,
				},
				// 5
				{
					'title': slide.title5,
					'image': slide.image5,
					'price': slide.price5,
					'salePrice': slide.salePrice5,
				}
			];


		
		// handles images being brought in from curalate links
		function jsx(html, ...args) {
			return html.slice(1).reduce((str, elem, i) => str + args[i] + elem, html[0]);
		}

		// make jsx for products
		slideProductsData.forEach((product) => {
			
		})

		const socialPicture = document.createElement('picture')
		const productPicture = document.createElement('picture')

		socialPicture.innerHTML = jsx`
		<source sizes="352.25px" srcset="${slide.profileImage}=/w/150?typ=webp 150w,${slide.profileImage}/w/300?typ=webp 300w,${slide.profileImage}/w/450?typ=webp 450w,${slide.profileImage}/w/600?typ=webp 600w" type="image/webp">
			  <source sizes="352.25px" 
		srcset="${slide.profileImage}=/w/150? 150w,${slide.profileImage}/w/300? 300w,${slide.profileImage}/w/450? 450w,${slide.profileImage}/w/600? 600w" type="image/webp">
		<img alt="..." 
			src="https://edge.curalate.com/sites/anntaylor-wcpeme/experiences/custom-carousel-1597850128186/assets/imagePlaceholder.png">
		`;
		// // //

		const togglePopout = (isOpen) => {
			// isOpen is true (popout is open)
			if(isOpen){
				// toggle class to hide div
				// set data attribute to opposite of isOpen (false)
			} else {
				// popout is closed, toggle class & dataAttribute
			}
		}
		
		const createdSlide = document.createElement('li');
		createdSlide.dataset.slideIndex = idx;
		createdSlide.setAttribute('id', `carousel-${carouselId}-slide-${idx}`);
		createdSlide.classList.add('carousel-slide');
			
		createdSlide.innerHTML = `
		<div class="slide-image">
			${socialPicture.outerHTML}
		</div>
		<div class="hover">
			likes	handle
			shop the look
		</div>
		<div class="popout-wrapper">
			<div class="popout-header>
				<h4>Shop The Look</h4>
				<div>${slide.likes} ${slide.handle}</div>
				<button class="close-popout" onClick={clickToClose}>
					insert close icon here
				</button>
			</div>

			<div class="new-arrivals">
				<h4>New Arrivals</h4>
				<p>Just-in styles, right this way...</p>
				<a href="https://www.anntaylor.com/new-arrivals/cata00008?loc=Curalate_NewArrivals&ICID=Curalate_NewArrivals">
					Shop Now
				</a>
			</div>
		</div>
		`

		const labeledBy = createdSlide.querySelector('h1, h2, h3, h4, h5, h6');
		if (labeledBy) {
			createdSlide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
		}

		slidesWrapper.append(createdSlide);

		if (slideIndicators) {
			const indicator = document.createElement('li');
			indicator.classList.add('carousel-slide-indicator');
			indicator.dataset.targetSlide = idx;
			indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${slideData.length}</span></button>`;
			slideIndicators.append(indicator);
		}

		slidesWrapper.append(createdSlide);
	})

  container.append(slidesWrapper);
  block.prepend(container);

  if(!isSingleSlide) {
    bindEvents(block);
  }
}