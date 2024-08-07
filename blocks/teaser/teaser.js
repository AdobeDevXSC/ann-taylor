export default function decorate(block) {
	const blockImages = block.querySelectorAll('picture');

	// media query match that indicates mobile/tablet width
	const isDesktop = window.matchMedia('(min-width: 1024px)');

	function toggleImage() {
		const desktopImage = blockImages[0];
		const mobileImage = blockImages[1];
		
		if(isDesktop.matches){
			mobileImage.closest('div').className = 'hidden';
			desktopImage.closest('div').className = '';
		} else {
			desktopImage.closest('div').className = 'hidden';
			mobileImage.closest('div').className = ''
		}
	}
	
	toggleImage();
	isDesktop.addEventListener('change', () => toggleImage());
  }