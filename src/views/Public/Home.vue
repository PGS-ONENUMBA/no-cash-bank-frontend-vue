<template>
    <main>
      <HeroSection />
      <VideoModal />
      <AboutUs />
      <WhatWeOffer />
      <FAQSection />
    </main>
  </template>

  <script>
  import HeroSection from '@/components/HeroSection.vue';
  import VideoModal from '@/components/VideoModal.vue';
  import AboutUs from '@/components/AboutUs.vue';
  import WhatWeOffer from '@/components/WhatWeOffer.vue';
  import FAQSection from '@/components/FAQSection.vue';

  export default {
    name: 'PublicHome',
    components: {
      HeroSection,
      VideoModal,
      AboutUs,
      WhatWeOffer,
      FAQSection,
    },
  };
  </script>
