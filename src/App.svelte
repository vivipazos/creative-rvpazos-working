<svelte:head>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;700&display=swap");
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
		<p>In my exploration of gathering personal data for 50 days, I discovered a new-found appreciation for the art of just dancing without a care in the world.</p>
		<p>My mission? To explore how <strong>mental health</strong> is quantified during academic study. I wanted to know how human emotions can be given a number, stripped of all it's nuance and meaning. Furthermore, how those numbers could then be used to make assumptions about someone's mental health.</p>
		<p>The following is an exploration of three data points I recorded daily; my sense of purpose, my positive and negative emotions, and any stressful events like arguments or discrimination.</p>
		<p class="endPar">Using this data, I then encoded these three points into 5 possible moods: <strong>happy, ok, neutral, sad</strong> and finally, <strong>upset</strong>. Each mood has a certain colour and dance step inspired by Laban Movement Analysis techniques.</p>

		<h2>Breaking down a <strong>happy</strong> day...</h2>

		<div class="legendSVG">
			<div class="desktop">
			<InlineSVG src={happySVG}/>
			</div>

			<div class="mobile">
			<InlineSVG src={happySVGmobile}/>
			</div>
		</div>

		<h2>...compared with a <strong>not so happy</strong> day.</h2>

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
		<h2>I found my moods could change <strong>every hour</strong> and for all sorts of reasons.</h2>
		<div class="desktop">
			<InlineSVG src={daySVG}/>
		</div>

		<div class="mobile">
			<InlineSVG src={daySVGmobile}/>
		</div>
		<p>This was one Sunday that ended up being a 'neutral' day overall because my sense of purpose was quite low and I was feeling lonely. If it wasn't for the fancy pancakes, it might have been a sadder day.</p>
		
		<h2>It seems that <strong>Sundays</strong> are my sadder days. Towards the end, my son had his birthday and this lifted my spirits.</h2>

		<div class="desktop">
			<InlineSVG src={monthSVG}/>
		</div>

		<div class="mobile">
			<InlineSVG src={monthSVGmobile}/>
		</div>

		<p>I was also coming out of a work funk in the beginning and ended on a career high so this helped boost my overall sense of purpose.</p>

		<h2>Why did I encode <strong>data into dance</strong>? It turns out, dancing can help boost your mental health too.</h2>

		<p>This is based entirely on a <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6052784/#CIT0021">study that measures how one's</a> "Sense of Purpose Moderates the Assocations between Daily Stressors and Daily Well-being". These data points are then encoded and indexed against my own averages for the 50 days. </p>
			
		<p>The dance moves are inspired by <a href="https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01389/full">Laban Movmement Analysis</a> techniques to portray emotions. For example, the 'happy' movement comes forward in the frame and uses higher hand gestures where the 'upset' movement steps backward in the frame and lowers the head to portray sadness.</p>

		<p>Finally, I was also inspired by Australian influencer, <a href="https://www.instagram.com/shani.chantel/?hl=en">Shani Chantel</a>, who lives and breathes all things female empowerment. She began a movement called <strong>Free Your Shit Fridays</strong> that urges women to let themselves dance to their favourite music in their underwear, with their kids on their hips and feel the freedom that comes with dancing.</p>
			
		<p>Apparently, just listening to music doesn't have quite the same effect but singing can help too!</p>

		<h2>Go on, throw on your favourite tune, belt out that ballad and <strong>shake what your mama gave you!</strong></h2>

		<video controls autoplay muted playsinline loop
		src="build/assets/video-end_4.mp4"
		poster="build/assets/poster.jpg">
		</video>

		<p class="About">This page was created by Rebecca Pazos for her final project in the creative module for her Masters for Visual Tools with the University of Girona. If you would like to connect with her, she is available on <a href="https://www.linkedin.com/in/rebeccapazos">LinkedIn</a> and <a href="https://twitter.com/vivi_pazos">Twitter</a>. </p> 
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
		font-size: 18px;
		line-height: 26px;
		font-weight: 300;
		font-family: 'Open Sans', sans-serif;
		max-width: 700px;
	}

	a {
		font-family: 'Open Sans', sans-serif;
		color: white;
		text-decoration: underline;
		font-weight: 300;
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

	.endPar {
		padding-bottom: 40px;
	}

	.About {
		font-size: 15px;
		opacity: 0.7;
		line-height: 20px;
		margin: 0 auto;
		padding-top: 50px;
		padding-bottom: 50px;
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

		.About {
			padding-bottom: 15px;
		}
	}
	/* section { height: 80vh; } */
</style>