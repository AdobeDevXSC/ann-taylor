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

    const slideNavNextButton = document.createElement('div');
	const slideNavPrevButton = document.createElement('div');
    slideNavNextButton.classList.add('carousel-navigation-buttons', 'next');
	slideNavPrevButton.classList.add('carousel-navigation-buttons', 'prev');
    slideNavNextButton.innerHTML = `
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
	 slideNavPrevButton.innerHTML = `
		<button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
	`;

    container.append(slideNavPrevButton, slideNavNextButton);
  }
  

	// fetch and manage slide data from json and process related display elements
	const link = block.querySelector('a');
  	const slideData = await fetchJson(link);

	// individual slide structure
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

		function jsx(html, ...args) {
			return html.slice(1).reduce((str, elem, i) => str + args[i] + elem, html[0]);
		}

		// make jsx for each profile's products panel
		const productsContainer = document.createElement('div');
		var productCounter = 0;

		slideProductsData.forEach(product => {
			// make individual product wrapper
			const productWrapper = document.createElement('div');

			// process product image from curalate link
			const productPicture = document.createElement('picture')
			productPicture.innerHTML = jsx`
				<source sizes="352.25px" srcset="${product.image}=/w/150?typ=webp 150w,${product.image}/w/300?typ=webp 300w,${product.image}/w/450?typ=webp 450w,${product.image}/w/600?typ=webp 600w" type="image/webp">
				<source sizes="352.25px" srcset="${product.image}=/w/150? 150w,${product.image}/w/300? 300w,${product.image}/w/450? 450w,${slide.profileImage}/w/600? 600w" type="image/webp">
				<img alt="..." src="https://edge.curalate.com/sites/anntaylor-wcpeme/experiences/custom-carousel-1597850128186/assets/imagePlaceholder.png">
			`;

			// if product info is not empty, set innerHtml with product details;
			if(product.title !== '' && product.image !== ''){
				productCounter ++;
				productWrapper.innerHTML = `
					<div class="product-image">
						${productPicture.outerHTML}
					</div>
					<div class="product-content">
						<p>${product.title}</p>
						<p class="prices"><span>${product.price}</span><span>${product.salePrice}</span></p> 
					</div>
				`;
			} else {
				// product info is empty, set innerHtml as empty
				productWrapper.className = "empty";
			}

			if(product.salePrice){
				const sale = productWrapper.querySelector('.prices');
				sale.classList.add('has-sale');
			}

			if(!productWrapper.classList.contains("empty")){
				productsContainer.append(productWrapper);
			}
			productsContainer.className = `products-container`;
		});

		const newArrivals = document.createElement('div');
		newArrivals.className = "new-arrivals";
		newArrivals.innerHTML = `
			<h4>New Arrivals</h4>
			<p>Just-in styles, right this way...</p>
			<a href="https://www.anntaylor.com/new-arrivals/cata00008?loc=Curalate_NewArrivals&ICID=Curalate_NewArrivals">
				Shop Now
			</a>`;

		productsContainer.append(newArrivals);
			
		// process profile image from curalate link
		const socialPicture = document.createElement('picture');
		socialPicture.innerHTML = jsx`
			<source sizes="352.25px" srcset="${slide.profileImage}=/w/150?typ=webp 150w,${slide.profileImage}/w/300?typ=webp 300w,${slide.profileImage}/w/450?typ=webp 450w,${slide.profileImage}/w/600?typ=webp 600w" type="image/webp">
			<source sizes="352.25px" srcset="${slide.profileImage}=/w/150? 150w,${slide.profileImage}/w/300? 300w,${slide.profileImage}/w/450? 450w,${slide.profileImage}/w/600? 600w" type="image/webp">
			<img alt="..." src="https://edge.curalate.com/sites/anntaylor-wcpeme/experiences/custom-carousel-1597850128186/assets/imagePlaceholder.png">
		`;
		
		// slide rendering structure
		const createdSlide = document.createElement('li');
		createdSlide.dataset.slideIndex = idx;
		createdSlide.setAttribute('id', `carousel-${carouselId}-slide-${idx}`);
		createdSlide.classList.add('carousel-slide');
		
		createdSlide.innerHTML = `
			<button class="popout-trigger">
				<div class="slide-image">
					${socialPicture.outerHTML}
					<div class="profile-hover">
						<p><img class="icon" src="/icons/filled-heart.svg"/>${slide.likes}</p>
						<p>${slide.handle}</p>
						<p class="underline">Shop The Look</p>
					</div>
				</div>
			</button>
			<div class="popout-wrapper" id="slide-${idx}-popout">
				<div class="popout-header">
					<h4>Shop The Look</h4>
					<div>
						<p><img class="icon" src="/icons/filled-heart.svg" />${slide.likes}</p>
						<p>${slide.handle}</p>
					</div>
					<button class="close-popout">
						<img class="icon" src="/icons/close.svg" />
					</button>
				</div>
				<div class="popout-content products-${productCounter}-up">
					${productsContainer.outerHTML}
				</div>
			</div>
		`;

		if (slideIndicators) {
			const indicator = document.createElement('li');
			indicator.classList.add('carousel-slide-indicator');
			indicator.dataset.targetSlide = idx;
			indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${slideData.length}</span></button>`;
			slideIndicators.append(indicator);
		}

		const togglePopout = () => {
			const allPopouts = [...block.querySelectorAll(".popout-wrapper")];
			allPopouts.forEach(popout => {
				// find current slide popout			
				if(popout.id == `slide-${idx}-popout`){
					// check if current popout is already active
					if(popout.classList.contains("active")){
						// if active, set to not active to close popout
						popout.classList.remove("active");
						createdSlide.classList.remove("popout-active");
					} else {
						// and set to active to open popout
						popout.classList.add("active");
						createdSlide.classList.add("popout-active");
					}
				}
				// close all other popouts
				if(popout.id !== `slide-${idx}-popout`){
					popout.classList.remove("active");

				}
			});

			// remove active class from all other slides except current slide
			const allSlides = [...block.querySelectorAll(".carousel-slide")];
			allSlides.forEach(slide => {
				if(Number(slide.dataset.slideIndex) !== idx){
					slide.classList.remove("popout-active")
				}
			});
		};

		const closePopout = () => {
			const currentPopout = block.querySelector(`#slide-${idx}-popout`);
			const currentSlide = block.querySelector(`#carousel-${carouselId}-slide-${idx}`);
			
			if(currentPopout.classList.contains("active")){
				currentPopout.classList.remove("active");
				currentSlide.classList.remove("popout-active");
			};
		}

		const popoutTrigger = createdSlide.querySelector(".popout-trigger");
		popoutTrigger.onclick = function(){togglePopout()}
	
		const closeButton = createdSlide.querySelector(".close-popout");
		closeButton.onclick = function(){closePopout()}

		slidesWrapper.append(createdSlide);
	});

	container.append(slidesWrapper);
	block.prepend(container);

	// close popouts when navigating carousel
	const closeAllPopouts = () => {
		const allPopouts = [...block.querySelectorAll(".popout-wrapper")];
		allPopouts.forEach(popout => {
			if(popout.classList.contains("active")){
				popout.classList.remove("active");
			}
		})
		const allSlides = [...block.querySelectorAll(".carousel-slide")];
		allSlides.forEach(slide => {
			if(slide.classList.contains("popout-active")){
				slide.classList.remove("popout-active")
			}
		});
	};

	const navButtons = block.querySelectorAll('.carousel-navigation-buttons')
	navButtons.forEach(button => {
		button.onclick = function(){closeAllPopouts()};
	});


	if(!isSingleSlide) {
		bindEvents(block);
	}
}