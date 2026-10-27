<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getUser } from '../auth'

const router = useRouter()

onMounted(async () => {
  const user = await getUser()
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (!snap.exists()) router.replace('/profile')
})
</script>

<template>
  <v-container max-width="480">
    <h1 class="text-h5 mt-8 mb-2">What do you want to do?</h1>
    <p class="text-body-2 mb-6">Join a game or set one up.</p>
    <v-btn color="primary" block size="large" class="mb-4" to="/find">Find an event</v-btn>
    <v-btn variant="outlined" block size="large" to="/events/create">Create an event</v-btn>
    <v-btn variant="text" block class="mt-4" to="/events">My events</v-btn>
    <v-btn variant="text" block to="/profile">Edit profile</v-btn>
  </v-container>
</template>