<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { getUser } from '../../auth'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const event = ref(null)
const notFound = ref(false)
const myStatus = ref(null)
const error = ref('')
const busy = ref(false)
let uid = null
let profile = { displayName: 'Player', skillLevel: null }
const stops = []
const snackbar = ref(false)
const snackbarText = ref('')
const messages = {
  awaiting: 'Status set to Awaiting',
  confirmed: "You're in! See you there",
  notGoing: 'Status set to Not going',
}

const options = [
  { label: 'Awaiting', value: 'awaiting' },
  { label: 'Yes', value: 'confirmed' },
  { label: 'No', value: 'notGoing' },
]

onMounted(async () => {
  const user = await getUser()
  uid = user.uid
  const p = await getDoc(doc(db, 'users', uid))
  if (p.exists()) profile = p.data()

  stops.push(
    onSnapshot(doc(db, 'events', id), (snap) => {
      if (snap.exists()) event.value = snap.data()
      else notFound.value = true
    }),
  )
  stops.push(
    onSnapshot(doc(db, 'events', id, 'attendees', uid), (snap) => {
      myStatus.value = snap.exists() ? snap.data().status : null
    }),
  )
})
onUnmounted(() => stops.forEach((s) => s()))

const isFull = computed(() => event.value && event.value.confirmedCount >= event.value.capacity)
const mapsUrl = computed(
  () => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(event.value.venue),
)

function dayLabel(d) {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
const dayText = computed(() => dayLabel(event.value.startsAt.toDate()))
const timeText = computed(() =>
  event.value.startsAt.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
)

async function setStatus(newStatus) {
  error.value = ''
  busy.value = true
  const eventRef = doc(db, 'events', id)
  const attRef = doc(db, 'events', id, 'attendees', uid)
  try {
    await runTransaction(db, async (tx) => {
      snackbarText.value = messages[newStatus]
      snackbar.value = true  
      const eventSnap = await tx.get(eventRef)
      const attSnap = await tx.get(attRef)
      if (!eventSnap.exists()) throw new Error('NOT_FOUND')
      const ev = eventSnap.data()
      if (ev.status === 'cancelled') throw new Error('CANCELLED')

      const oldStatus = attSnap.exists() ? attSnap.data().status : null
      if (oldStatus === newStatus) return

      let count = ev.confirmedCount
      if (newStatus === 'confirmed') {
        if (count >= ev.capacity) throw new Error('FULL')
        count++
      }
      if (oldStatus === 'confirmed' && newStatus !== 'confirmed') count--

      tx.set(attRef, {
        status: newStatus,
        displayName: profile.displayName,
        skillLevel: profile.skillLevel ?? null,
        updatedAt: serverTimestamp(),
      })
      tx.update(eventRef, { confirmedCount: count })
    })
  } catch (e) {
    if (e.message === 'FULL') error.value = 'Sorry, this event is full.'
    else if (e.message === 'CANCELLED') error.value = 'This event was cancelled.'
    else {
      console.error(e)
      error.value = 'Error: ' + e.message
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <v-container max-width="480">
    <v-btn icon="mdi-arrow-left" variant="outlined" size="small" @click="router.back()" />
    <p v-if="notFound" class="mt-4">Event not found.</p>

    <div v-else-if="event">
      <h1 class="text-h5 text-center my-6">{{ event.name }}</h1>

      <v-card variant="flat" class="pa-4 mb-6">
        <div class="d-flex justify-space-between mb-4">
          <v-chip size="small">{{ dayText }}</v-chip>
          <v-chip size="small">{{ timeText }}</v-chip>
          <v-chip size="small">{{ event.confirmedCount }}/{{ event.capacity }}</v-chip>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ event.description }}</p>
        <div class="d-flex align-center ga-3 mb-4">
          <v-icon icon="mdi-map-marker-outline" />
          <div>
            <div class="text-caption text-medium-emphasis">Venue</div>
            <div class="font-weight-bold">{{ event.venue }}</div>
          </div>
        </div>
        <v-btn color="primary" block size="large" :href="mapsUrl" target="_blank">
          Tap here to find the location
        </v-btn>
      </v-card>

      <h2 class="text-subtitle-1 font-weight-bold mb-2">Attend event?</h2>
      <div class="d-flex ga-2">
        <v-btn
          v-for="opt in options"
          :key="opt.value"
          style="flex: 1 1 0"
          size="large"
          :variant="myStatus === opt.value ? 'flat' : 'outlined'"
          :color="myStatus === opt.value ? 'primary' : undefined"
          :disabled="busy || event.status === 'cancelled' || (opt.value === 'confirmed' && isFull && myStatus !== 'confirmed')"
          @click="setStatus(opt.value)"
        >
          {{ opt.label }}
        </v-btn>
      </div>
      <p v-if="isFull && myStatus !== 'confirmed'" class="text-caption mt-2">This event is full.</p>
      <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
    </div>
        <v-snackbar v-model="snackbar" color="success" :timeout="2500">
        {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>