import { makeVideo } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  decorateIcons(block);
  
  if (Object.values(block.classList).includes('video')) {
    // const desktopVideoSrc = block.querySelector('div > a');
    const mobileVideoSrc = block.querySelector('div > a');
	
	console.log(mobileVideoSrc)


	const isDesktop = window.matchMedia('(min-width: 1024px)');

    if(videoSrc.href.includes(window.hlx.codeBasePath)) {
      videoSrc.href = videoSrc.text;
    }

    makeVideo(block.querySelector('div'), videoSrc.href);
    videoSrc.remove();
  }
}