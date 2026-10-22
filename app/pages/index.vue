<script setup lang="ts">
import { salon, locations } from '~/data/salon'

const current = locations[0]!

// Разметка для Google: карточка бизнеса с адресом и часами работы
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NailSalon',
      'name': salon.brand,
      'alternateName': `${salon.brand} ${salon.signature}`,
      'founder': { '@type': 'Person', 'name': salon.owner },
      'telephone': salon.phone,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': `${current.street.ru}, ${current.details.ru}`,
        'addressLocality': 'Астана',
        'addressCountry': 'KZ',
      },
      'geo': { '@type': 'GeoCoordinates', 'latitude': current.lat, 'longitude': current.lon },
      'openingHours': 'Mo-Su 09:00-22:00',
      'aggregateRating': { '@type': 'AggregateRating', 'ratingValue': salon.rating, 'ratingCount': salon.ratingCount },
      'sameAs': [salon.instagram, salon.twoGis],
    }),
  }],
})
</script>

<template>
  <div>
    <ThePreloader />
    <TheHeader />
    <main>
      <HeroSection />
      <WhySection />
      <GallerySection />
      <ServicesSection />
      <BookingSection />
      <LocationSection />
      <ReviewsSection />
      <TrainingSection />
      <FaqSection />
    </main>
    <TheFooter />
    <MobileBookBar />
    <ToastStack />
  </div>
</template>
