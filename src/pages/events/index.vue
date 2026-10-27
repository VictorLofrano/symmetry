<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import { getUser } from '../../auth'

const router = useRouter()
const events = ref([])

onMounted(async () => {
  const user = await getUser()
  const snap = await getDocs(query(collection(db, 'events'), where('organizerId', '==', user.uid)))
  events.value = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.startsAt.toMillis() - b.startsAt.toMillis())
})

function when(ev) {
  const d = ev.startsAt.toDate()
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}
const statusLabel = { open: 'Open', confirmed: 'Confirmed', cancelled: 'Cancelled' }
</script>

<template>
  <v-container max-width="480">
    <v-btn icon="mdi-arrow-left" variant="outlined" size="small" @click="router.back()" />
    <h1 class="text-h5 mt-4">Posted events</h1>
    <p class="text-body-2 mb-4">{{ events.length }} published events</p>

    <v-card v-for="ev in events" :key="ev.id" variant="outlined" class="mb-4 pa-4">
      <div class="d-flex justify-space-between align-center">
        <div class="text-h6">{{ ev.name }}</div>
        <v-chip size="small">{{ statusLabel[ev.status] }}</v-chip>
      </div>
      <div class="text-body-2">{{ when(ev) }}</div>
      <div class="text-body-2">Venue: {{ ev.venue }}</div>
      <div class="d-flex justify-space-between text-body-2 my-2">
        <span>Players joined</span><span>{{ ev.confirmedCount }}/{{ ev.capacity }}</span>
      </div>
      <v-btn variant="outlined" block :to="`/events/${ev.id}`">View / manage event</v-btn>
    </v-card>

    <v-btn color="primary" block size="large" to="/events/create">Create another event</v-btn>
  </v-container>
</template>