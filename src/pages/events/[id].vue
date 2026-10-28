<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, collection, getDocs, writeBatch, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { getUser } from '../../auth'

const route = useRoute()
const router = useRouter()
const event = ref(null)
const notFound = ref(false)
const isOrganizer = ref(false)
const confirmDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')
let stop = null

onMounted(async () => {
  const user = await getUser()
  stop = onSnapshot(doc(db, 'events', route.params.id), (snap) => {
    if (snap.exists()) {
      event.value = snap.data()
      isOrganizer.value = snap.data().organizerId === user.uid
    } else {
      notFound.value = true
    }
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
async function deleteEvent() {
  deleting.value = true
  deleteError.value = ''
  try {
    const id = route.params.id
    const attendees = await getDocs(collection(db, 'events', id, 'attendees'))
    const batch = writeBatch(db)
    attendees.forEach((a) => batch.delete(a.ref))
    batch.delete(doc(db, 'events', id))
    await batch.commit()
    router.replace('/events')
  } catch (e) {
    console.error(e)
    deleteError.value = 'Error: ' + e.message
    deleting.value = false
  }
}
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
            <v-btn
        v-if="isOrganizer"
        color="error"
        variant="outlined"
        block
        class="mt-2"
        @click="confirmDelete = true"
      >
        Delete event
      </v-btn>
    </div>
        <v-dialog v-model="confirmDelete" max-width="360">
      <v-card class="pa-4">
        <div class="text-h6 mb-2">Delete this event?</div>
        <p class="text-body-2 mb-4">
          Players will no longer see it, and their responses will be removed. This cannot be undone.
        </p>
        <v-alert v-if="deleteError" type="error" class="mb-4">{{ deleteError }}</v-alert>
        <div class="d-flex ga-2">
          <v-btn variant="outlined" style="flex: 1" :disabled="deleting" @click="confirmDelete = false">
            Cancel
          </v-btn>
          <v-btn color="error" style="flex: 1" :loading="deleting" @click="deleteEvent">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>