export default function decorate(block) {
	const blockImages = block.querySelectorAll('img');
	const isHero = block.classList.contains('hero');

	// media query match that indicates mobile/tablet width
	const isDesktop = window.matchMedia('(min-width: 1024px)');
	
	function toggleImage() {
		const desktopImage = blockImages[0];
		const mobileImage = blockImages[1];
		
		if(isDesktop.matches){
			mobileImage.closest('div').className = 'hidden';
			desktopImage.closest('div').className = '';
			if(isHero){
				desktopImage.removeAttribute('loading'); // Lighthouse recommendation: remove lazy-loading
				desktopImage.setAttribute('loading', 'eager');
			}
		} else {
			desktopImage.closest('div').className = 'hidden';
			mobileImage.closest('div').className = ''
			if(isHero){
				mobileImage.removeAttribute('loading'); // Lighthouse recommendation: remove lazy-loading
				mobileImage.setAttribute('loading', 'eager');
			}
		}
	}
	
	toggleImage();
	isDesktop.addEventListener('change', () => toggleImage());
  }

  