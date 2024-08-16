/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */

export default async function decorate(block) {
	const blockChildren = block.children[0];
	[...blockChildren.children].forEach((child) => {
	  const pictureElement = child.querySelectorAll('picture');
	  if (pictureElement.length > 0) {
		pictureElement.forEach((pic, index) => {
		  if (index === 0) {
			pic.classList.add('hero-desktop');
		  } else if (index === 1) {
			pic.classList.add('hero-mobile');
		  }
		  child.className = 'hero-image';
		});
	  } else {
		child.className = 'hero-desc-wrapper';
	  }
	});
  
	const imageElements = block.querySelectorAll('img');
	imageElements.forEach((img) => {
	  img.removeAttribute('loading'); // Lighthouse recommendation: remove lazy-loading
	  img.setAttribute('loading', 'eager');
	});
  }