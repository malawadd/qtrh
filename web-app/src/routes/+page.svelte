<script>
    import MultiToken from '../lib/components/illustrations/multi-token.svelte';
    import ImageAndCaption from './components/image-and-caption.svelte';
    import LpCard from './components/lp-card/lp-card.svelte';
    import LpHeader from './components/lp-header.svelte';
    import NoWrappedTokens from '../lib/components/illustrations/no-wrapped-tokens.svelte';
    import OneBalance from '../lib/components/illustrations/one-balance.svelte';
    import MockDashboard from './components/mock-dashboard/mock-dashboard.svelte';
    import Button from '$lib/components/button/button.svelte';
    import BigLogo from '$lib/components/illustrations/big-logo.svelte';
    import { onMount } from 'svelte';
    import isRunningInSafe from '$lib/utils/is-running-in-safe';
    import { goto } from '$app/navigation';
  
    onMount(() => {
      // When launching within a Safe, we don't want to display the landing page.
      if (isRunningInSafe()) goto('/app', { replaceState: true });
    });
  </script>
  
  <svelte:head>
    <title>Ktrh • Money streaming </title>
    <meta
      name="description"
      content="ktrh  is a Web3 toolkit that enables developers to stream money without any platform fees."
    />
  </svelte:head>
  
  <LpHeader />
  <div id="lp">
    <div id="wrapper">
      <section id="hero">
        <div id="hero-illustration">
          <BigLogo />
          
        <div id="title">
          <h1>Money streaming service</h1>
        </div>
      
      </section>
      <section id="main-features">
        <LpCard
          ><div id="streaming" class="full-width-card illustration-right">
            <div class="card-description">
              <h2>Send & receive funds by the second</h2>
              <p>
                KTRH enables token streams of any ERC-20 to any Filecoin address with per-second
                settlement.
              </p>
            </div>
            <div class="card-illustration grey-background">
              <div id="mock-dashboard">
                <MockDashboard />
              </div>
            </div>
          </div></LpCard
        >
        
      </section>
      <section>
        <section />
        <section class="grid">
          <LpCard
            ><ImageAndCaption background>
              <MultiToken slot="image" />
              <div slot="caption" class="text-container">
                <h3>No platform fees</h3>
                <p>
                  KTRH is entirely open-source, and doesn't charge anything extra on top of network
                  gas fees.
                </p>
              </div>
            </ImageAndCaption></LpCard
          >
          <LpCard
            ><ImageAndCaption background>
              <OneBalance slot="image" />
              <div slot="caption" class="text-container">
                <h3>One balance for all your streams</h3>
                <p>Fund multiple streams using one account balance in a single transaction.</p>
              </div>
            </ImageAndCaption></LpCard
          >
          
          <LpCard
            ><ImageAndCaption background>
              <NoWrappedTokens slot="image" />
              <div slot="caption" class="text-container">
                <h3>No need to wrap tokens</h3>
                <p>
                  Use ERC-20 tokens “as is”. No need to wrap them or trust a third party with your
                  tokens.
                </p>
              </div>
            </ImageAndCaption></LpCard
          >
        </section>
      </section>
     
      <section>
        <LpSectionHeader>
          <div class="text-container centered">
            <h2>Stay up to date</h2>
            <div class="flex gap-4">
              <a href="" target="_blank" rel="noreferrer"
                ><Button variant="primary">Twitter</Button></a
              >
              <a href="" target="_blank" rel="noreferrer"
                ><Button variant="primary">Discord</Button></a
              >
            </div>
          </div>
        </LpSectionHeader>
      </section>
      
    </div>
  </div>
  
  <style>
    #lp {
      --spacing-xs: 0.5rem;
      --spacing-s: 1rem;
      --spacing-m: 1.5rem;
      --spacing-l: 3rem;
      --spacing-xl: 6rem;
  
      --border-radius-pointy: 2rem 0 2rem 2rem;
      --border-radius-pointy-inner: 1rem 0 1rem 1rem;
  
      --font-serif: 'Redaction 50';
  
      --font-size-s: 1rem;
      --font-size-m: 1.5rem;
      --font-size-l: 2.5rem;
      --font-size-xl: 3rem;
    }
  
    @keyframes intro {
      0% {
        opacity: 0;
        transform: translateY(2rem);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    .nudge {
      font-size: inherit;
      letter-spacing: 0.18em;
    }
  
    h1,
    h2,
    h3 {
      color: var(--color-foreground);
      font-weight: normal;
    }
  
    h1 {
      font-size: var(--font-size-xl);
      font-family: var(--font-serif);
      color: var(--color-primary);
    }
  
    h2 {
      font-size: var(--font-size-l);
      font-family: var(--font-serif);
      line-height: 2.5rem;
    }
  
    h3 {
      font-size: var(--font-size-m);
      font-family: var(--font-serif);
    }
  
    section {
      position: relative;
    }
  
    .centered {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    .text-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    #wrapper {
      max-width: 80rem;
      width: 100vw;
      margin: 0 auto;
      padding: 1rem;
      padding-top: 6rem;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-m);
      align-items: center;
    }
  
    #wrapper > * {
      width: 100%;
    }
  
    img.elevated {
      box-shadow: 0.5rem 0.5rem 0px var(--color-foreground);
      border-radius: 1rem 0 1rem 1rem;
      border: 1px solid var(--color-foreground);
    }
  
    #hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 0.5rem 2rem 0.5rem;
      z-index: 10;
    }
  
    #hero .beta-notice {
      background-color: var(--color-caution-level-1);
      color: var(--color-caution-level-6);
      padding: 0.5rem 1.5rem;
      border-radius: 2rem 0 2rem 2rem;
      border: 1px solid var(--color-caution-level-6);
      max-width: 44rem;
      margin-top: 3rem;
    }
  
    #hero .beta-notice a {
      text-decoration: underline;
    }
  
    #hero #hero-illustration {
      margin-bottom: 4rem;
      position: relative;
      width: 100%;
    }
  
    #hero #hero-illustration .coin {
      position: absolute;
      width: 100%;
      cursor: pointer;
    }
  
    #hero #hero-illustration .coin.first {
      transform: rotate(-45deg);
    }
  
    #hero #hero-illustration .coin.second {
      transform: rotate(45deg);
    }
  
    #hero #hero-illustration .coin.third {
      transform: rotate(135deg);
    }
  
    .full-width-card {
      display: grid;
      column-gap: 1rem;
      overflow: hidden;
    }
  
    .full-width-card.illustration-left {
      grid-template-columns: 1fr 1fr;
    }
  
    .full-width-card.illustration-right {
      grid-template-columns: 1fr 1fr;
    }
  
    .full-width-card > .card-description {
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
    }
  
    .full-width-card > .card-illustration {
      padding: 3rem;
      position: relative;
      max-height: 31rem;
    }
  
    .full-width-card > .card-illustration > .blue-background {
      background-color: var(--color-primary-level-1);
      position: absolute;
      height: calc(100% - 4rem);
      width: 100%;
      top: 2rem;
    }
  
    .full-width-card.illustration-left.text-nudged > .card-description {
      transform: translateX(-3rem);
    }
  
    .full-width-card.illustration-right.text-nudged > .card-description {
      transform: translateX(3rem);
    }
  
    .full-width-card.illustration-right > .card-illustration > .blue-background {
      left: 50%;
      border-radius: 2rem 0 0rem 2rem;
    }
  
    .full-width-card.illustration-left > .card-illustration > .blue-background {
      right: 50%;
      border-radius: 0 0 2rem 0;
    }
  
    .grey-background {
      background-color: var(--color-foreground-level-1);
    }
  
    #main-features {
      display: flex;
      flex-direction: column-reverse;
      gap: 2rem;
    }
  
    #main-features > #raise-funds {
      margin-bottom: -7rem;
      overflow: visible;
    }
  

  
    #main-features #streaming > .card-illustration {
      padding: 2rem 0 2rem 1rem;
      border-radius: 0 0 2rem 0;
      overflow: hidden;
      isolation: isolate;
    }
  
 

    
  
    .illustration-container {
      height: 100%;
    }
  
    .illustration-container > .badge {
      height: 1.75rem;
    }
  
    .illustration-container > .illustration {
      height: calc(100% - 1.75rem);
    }
  
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  
    @media (max-width: 768px) {
      h1 {
        font-size: var(--font-size-l);
      }
  
      h2 {
        font-size: var(--font-size-m);
        line-height: 1.5rem;
      }
  
      .grid {
        grid-template-columns: 1fr;
      }
  
      .centered {
        align-items: flex-start;
        text-align: left;
      }
  
      .full-width-card.illustration-left {
        grid-template-columns: 1fr;
      }
  
      .full-width-card.illustration-right {
        grid-template-columns: 1fr;
      }
  
      .full-width-card.illustration-left.text-nudged > .card-description {
        transform: translateX(0);
      }
  
      .full-width-card.illustration-right.text-nudged > .card-description {
        transform: translateX(0);
      }
  
      #main-features > #raise-funds {
        margin-bottom: 0;
      }
  
      .full-width-card > .card-description {
        padding: 1rem;
      }
  
      .full-width-card > .card-illustration {
        padding: 1rem 0 1rem 0;
      }
  
      #main-features #streaming > .card-illustration {
        padding: 2rem 0 2rem 0;
      }
  
      #main-features > #raise-funds > #raise-funds-description {
        transform: none;
      }
  
      
    }
  
    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  
    .hover {
      position: absolute;
      width: 18%;
      height: 18%;
      animation: hover 4s ease-in-out infinite;
    }
  
    .hover:nth-of-type(1) {
      top: 45%;
      left: 10%;
      animation-delay: -0.5s;
      animation-duration: 3.9s;
    }
  
    .hover:nth-of-type(2) {
      top: 28%;
      left: 41%;
    }
  
    .hover:nth-of-type(3) {
      animation-delay: -1s;
      top: 45%;
      right: 10%;
      animation-duration: 4.1s;
    }
  
    @keyframes hover {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(10%);
      }
      100% {
        transform: translateY(0);
      }
    }
  </style>
  