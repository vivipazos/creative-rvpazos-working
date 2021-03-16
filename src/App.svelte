<svelte:head>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;700&family=Shippori+Mincho+B1:wght@400;800&display=swap");
    </style>
</svelte:head>

<script>
	
	import InlineSVG from 'svelte-inline-svg';

	// desktop
	const introDesktop = 'build/assets/intro-desktop.svg';
	const happySVG = 'build/assets/happy.svg';
	const angrySVG = 'build/assets/angry.svg';
	const monthSVG = 'build/assets/month.svg';
	const daySVG = 'build/assets/day.svg';

	// mobile
	const introMobile = 'build/assets/intro-mobile.svg';
	const happySVGmobile = 'build/assets/happy-mobile.svg';
	const angrySVGmobile = 'build/assets/angry-mobile.svg';
	const monthSVGmobile = 'build/assets/month-mobile.svg';
	const daySVGmobile = 'build/assets/day-mobile.svg';

	import { gsap } from "gsap";
	import { ScrollTrigger } from "gsap/ScrollTrigger";

	gsap.registerPlugin(ScrollTrigger);

	const scrolltext = document.querySelector('.scrolltext')

	ScrollTrigger.create({
  	trigger: scrolltext,
  	start: "top center",
  	end: "+=500",
  	onToggle: self => console.log("toggled. active?", self.isActive)
	});

	// import Scroller from '@sveltejs/svelte-scroller';
	// let index, offset, progress;

</script>
 
<div class="desktop">
	<InlineSVG src={introDesktop}/>
</div>

<div class="mobile">
	<InlineSVG src={introMobile}/>
</div>

<main>
	<div class="header">
		<h1>50 days, 50&nbsp;moves</h1>
		<p class="deck">An exploration of emotions, tracked with data, visualised through dance.</p>
		<p class="byline">By Rebecca Pazos</p>
	</div>

	<div class="section1">
		<p>Dance like no-one's watching and the world might just start to feel right again.
		<p>In my exploration of gathering personal data for 60 days, I discovered a new-found appreciation for the art of just dancing without a care in the world. My mission was to explore how mental health was quantified into academic study, how human emotions can be given a number on a range, stripping it of all it's nuance and meaning. Furthermore, how those numbers could then be used to make assumptions about someone's mental state.</p>
		<p>The following is an exploration of three data points taken on each day for almost 60 days; my sense of purpose, my positive and negative emotions and my stressors - arguments, difficulties.</p>

		<h2>The anatomy of a <strong>happy</strong> day...</h2>

		<div class="legendSVG">
			<div class="desktop">
			<InlineSVG src={happySVG}/>
			</div>

			<div class="mobile">
			<InlineSVG src={happySVGmobile}/>
			</div>
		</div>

		
		
		<h2>...compared with a <strong>not so happy</strong> day...</h2>

		<div class="legendSVG">
			<div class="desktop">
			<InlineSVG src={angrySVG}/>
			</div>
			<div class="mobile">
			<InlineSVG src={angrySVGmobile}/>
			</div>
		</div>

	</div>

	<div class="section2">
		<h2>Not every hour of a day is equal. In just one day, I could go through many emotions.</h2>
		
		<div class="desktop">
			<InlineSVG src={daySVG}/>
		</div>

		<div class="mobile">
			<InlineSVG src={daySVGmobile}/>
		</div>
		
		<h2>Not every hour of a day is <strong>equal</strong>. In just one day, I could go through many emotions.</h2>

		<p class="body">The following is an exploration of three data points taken on each day for almost 60 days; my sense of purpose, my positive and negative emotions and my stressors - arguments, difficulties.</p>

		<div class="desktop">
			<InlineSVG src={monthSVG}/>
		</div>

		<div class="mobile">
			<InlineSVG src={monthSVGmobile}/>
		</div>

		<p class="body">The following is an exploration of three data points taken on each day for almost 60 days; my sense of purpose, my positive and negative emotions and my stressors - arguments, difficulties.</p>

		<p class="body">The following is an exploration of three data points taken on each day for almost 60 days; my sense of purpose, my positive and negative emotions and my stressors - arguments, difficulties.</p>

		<p class="body">The following is an exploration of three data points taken on each day for almost 60 days; my sense of purpose, my positive and negative emotions and my stressors - arguments, difficulties.</p>

		<video controls autoplay muted playsinline loop
		src="build/assets/video-end_4.mp4"
		poster="build/assets/poster.jpg">
		</video>
	</div>

</main>



<!-- <Scroller top={0.2} bottom={0.8} bind:index bind:offset bind:progress>
	<div slot="background">
	  <p>
		This is the background content. It will stay fixed
		in place while the foreground scrolls over the top.
	  </p>
  
	  <p>Section {index + 1} is currently active.</p>
	</div>
  
	<div slot="foreground">
	  <section>This is the first section.</section>
	  <section>This is the second section.</section>
	  <section>This is the third section.</section>
	</div>
</Scroller> -->

<style>
	:global(html) {
		background-color: #253243;

	}
	
	main {
		text-align: center;
		max-width: 1200px;
		width:100%;
		margin: 0 auto;
		font-family: 'Open Sans', sans-serif;
		color: white;
	}

	.section1, .section2 {
		text-align: left;
		margin: 0 auto;
		font-size: 18;
		line-height: 28px;
		font-weight: 300;
		font-family: 'Open Sans', sans-serif;
		max-width: 700px;
	}
	.header {
		display:inline-block;
		max-width: 600px;
		width:100%;
	}
	h1 {
		color: white;
		font-family: 'Open Sans', sans-serif;
		font-size: 3em;
		font-weight: 700;
		text-align: center;
		line-height: 1em;
		padding: 0 auto;
	}

	h2 {
		font-weight: 300;
		line-height: 1.3em;
		max-width: 700px;
		margin: 0 auto;
		text-align: left;
		font-size: 30px;
	}

	p.deck {
		font-weight: 200;
		font-size: 1.5em;
		opacity: 0.8;
	}
	
	p.byline {
		font-weight: 100;
		font-size: 1em;
		opacity: 0.5;
	}

	.desktop  {
		display: none;
		min-width: 480px;
	}

	.mobile {
		display: block;
		width: 100%;
		/* max-width: 480px; */
	}

	.legendSVG {
		max-width: 600px;
		margin: 50px 0;
	}

	video {
		width: 100%;
	}

	@media only screen and (min-width:600px){
		.mobile {
			display: none;
		}
		.desktop {
			display:block;
			max-width: 1200px;
			margin: 0 auto;
		}
		video{
			width: 300px;
			padding: 0 200px;

		}
		.section2, .section1 {
			width: 100%;
			margin: 0 auto;
			font-size: 22px;
			line-height: 30px;
		}

		h1 {
			font-size: 80px
		}

		h2 {
			padding: 1.3em 0 1em 0;
		}
	}
	/* section { height: 80vh; } */
</style>