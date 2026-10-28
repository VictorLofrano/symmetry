<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { getUser } from '../../auth'
import { sports } from '../../sports'

const router = useRouter()
const name = ref('')
const description = ref('')
const date = ref('')
const time = ref('')
const venue = ref('')
const capacity = ref(10)
const error = ref('')
const saving = ref(false)
const today = new Date().toISOString().slice(0, 10)
const sport = ref('basketball')

async function publish() {
  error.value = ''
  if (!name.value.trim() || !date.value || !time.value || !venue.value.trim()) {
    error.value = 'Please fill in the name, date, time and venue.'
    return
  }
  const cap = Number(capacity.value)
  if (!Number.isInteger(cap) || cap < 2) {
    error.value = 'Capacity must be a whole number of at least 2.'
    return
  }
  saving.value = true
  try {
    const user = await getUser()
    const docRef = await addDoc(collection(db, 'events'), {
      organizerId: user.uid,
      name: name.value.trim(),
      description: description.value.trim(),
      startsAt: Timestamp.fromDate(new Date(`${date.value}T${time.value}`)),
      venue: venue.value.trim(),
      capacity: cap,
      status: 'open',
      confirmedCount: 0,
      createdAt: serverTimestamp(),
      sport: sport.value,
    })
    router.push(`/events/${docRef.id}`)
  } catch (e) {
    console.error(e)
    error.value = 'Error: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container max-width="480">
    <v-btn icon="mdi-arrow-left" variant="outlined" size="small" @click="router.back()" />
    <h1 class="text-h5 mt-4">Event details</h1>
    <p class="text-body-2 mb-4">Set up your event so players can join.</p>

    <v-select v-model="sport" :items="sports" item-title="title" item-value="value" label="Sport" variant="outlined" />
    <v-text-field v-model="name" label="Event name" variant="outlined" />
    <v-textarea v-model="description" label="Short description" variant="outlined" rows="2" />
    <v-row>
      <v-col>
        <v-text-field v-model="date" label="Date" type="date" :min="today" variant="outlined" />
      </v-col>
      <v-col>
        <v-text-field v-model="time" label="Time" type="time" variant="outlined" />
      </v-col>
    </v-row>
    <v-text-field v-model="venue" label="Venue" variant="outlined" />
    <v-text-field
      v-model="capacity"
      label="Player capacity"
      type="number"
      variant="outlined"
      hint="Maximum number of players who can join."
      persistent-hint
    />

    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
    <p class="text-caption mt-6 mb-2">Publishing makes your event visible to players.</p>
    <v-btn color="primary" block size="large" :loading="saving" @click="publish">
      Publish event
    </v-btn>
  </v-container>
</template>