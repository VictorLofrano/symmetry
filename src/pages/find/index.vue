<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { getUser } from '../../auth'
import { sportIcon } from '../../sports'

const router = useRouter()
const events = ref([])
const search = ref('')
let stop = null

onMounted(async () => {
  await getUser()
  const q = query(
    collection(db, 'events'),
    where('startsAt', '>=', Timestamp.now()),
    orderBy('startsAt'),
  )
  stop = onSnapshot(q, (snap) => {
    events.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((e) => e.status !== 'cancelled')
  })
})
onUnmounted(() => stop && stop())

const shown = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return events.value
  return events.value.filter((e) =>
    [e.name, e.venue, e.description].some((t) => (t || '').toLowerCase().includes(term)),
  )
})

function dayLabel(d) {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function timeLabel(d) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <v-container max-width="480">
    <v-btn icon="mdi-arrow-left" variant="outlined" size="small" @click="router.back()" />
    <h2 class="text-subtitle-1 font-weight-bold mt-4 mb-2">Find activities nearby</h2>
    <v-text-field
      v-model="search"
      placeholder="Search activities"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-4"
    />

    <p v-if="!shown.length" class="text-body-2 text-medium-emphasis">No upcoming events found.</p>

    <v-card v-for="ev in shown" :key="ev.id" variant="flat" class="mb-2" :to="`/find/${ev.id}`">
      <div class="d-flex pa-2 ga-3">
        <v-sheet color="primary" rounded="lg" width="72" height="72" class="flex-shrink-0 d-flex align-center justify-center">
  <v-icon :icon="sportIcon(ev.sport)" size="36" color="white" />
</v-sheet>
        <div class="flex-grow-1" style="min-width: 0">
          <div class="d-flex justify-space-between">
            <span class="text-body-1">{{ ev.name }}</span>
            <span class="text-caption">{{ ev.venue }}</span>
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">{{ ev.description }}</div>
          <div class="d-flex justify-space-between text-caption mt-1">
            <span>{{ dayLabel(ev.startsAt.toDate()) }} {{ timeLabel(ev.startsAt.toDate()) }}</span>
            <span>{{ ev.confirmedCount }}/{{ ev.capacity }}</span>
          </div>
        </div>
      </div>
    </v-card>

    <div class="text-right mt-4">
      <v-btn variant="text" to="/events">My events</v-btn>
    </div>
  </v-container>
</template>
