<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { getUser } from '../../auth'

const route = useRoute()
const router = useRouter()
const event = ref(null)
const notFound = ref(false)
let stop = null

onMounted(async () => {
  await getUser()
  stop = onSnapshot(doc(db, 'events', route.params.id), (snap) => {
    if (snap.exists()) event.value = snap.data()
    else notFound.value = true
  })
})
onUnmounted(() => stop && stop())

const dateText = computed(() =>
  event.value.startsAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
)
const timeText = computed(() =>
  event.value.startsAt.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
)
const mapsUrl = computed(
  () =>
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(event.value.venue),
)
</script>

<template>
  <v-container max-width="480">
    <v-btn icon="mdi-arrow-left" variant="outlined" size="small" @click="router.back()" />
    <p v-if="notFound" class="mt-4">Event not found.</p>

    <div v-else-if="event">
      <v-card variant="tonal" class="my-4 pa-4">
        <div class="text-h6">Event published</div>
        <div class="text-body-2">Live and visible to players.</div>
      </v-card>

      <h1 class="text-h5">{{ event.name }}</h1>
      <p class="text-body-2 mb-4">{{ event.description }}</p>

      <div class="d-flex justify-space-between py-2 border-b"><span>Date</span><span>{{ dateText }}</span></div>
      <div class="d-flex justify-space-between py-2 border-b"><span>Time</span><span>{{ timeText }}</span></div>
      <div class="d-flex justify-space-between py-2 border-b"><span>Venue</span><span>{{ event.venue }}</span></div>
      <div class="d-flex justify-space-between py-2 border-b"><span>Capacity</span><span>{{ event.capacity }}</span></div>

      <v-btn color="primary" block size="large" class="my-4" :href="mapsUrl" target="_blank">
        Find location
      </v-btn>

      <div class="d-flex justify-space-between mb-4">
        <span>Joined</span><span>{{ event.confirmedCount }}/{{ event.capacity }}</span>
      </div>

      <v-btn variant="text" block to="/events">My events</v-btn>
    </div>
  </v-container>
</template>