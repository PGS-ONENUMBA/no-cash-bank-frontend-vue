<template>
  <div>
    <Navbar />
    <main>
      <HeroSection />
      <VideoModal />
      <AboutUs />
      <WhatWeOffer />
      <FAQSection />
    </main>
    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import HeroSection from './components/HeroSection.vue';
import VideoModal from './components/VideoModal.vue';
import AboutUs from './components/AboutUs.vue';
import WhatWeOffer from './components/WhatWeOffer.vue';
import FAQSection from './components/FAQSection.vue';
import Footer from './components/Footer.vue';

export default {
  components: {
    Navbar,
    HeroSection,
    VideoModal,
    AboutUs,
    WhatWeOffer,
    FAQSection,
    Footer,
  },
};
</script>

<style>
/* Global styles here */
</style>
