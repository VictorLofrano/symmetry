<script setup>
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/firebase'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const skillLevel = ref(3)
const message = ref('')
let uid = null

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      await signInAnonymously(auth)
      return
    }
    uid = user.uid
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      name.value = snap.data().displayName
      skillLevel.value = snap.data().skillLevel
    }
  })
})

async function save() {
  message.value = ''
  if (!name.value.trim()) {
    message.value = 'Please enter a name'
    return
  }
  if (!uid) {
    message.value = 'Not signed in yet. Check the browser console (F12).'
    return
  }
  try {
    await setDoc(doc(db, 'users', uid), {
      displayName: name.value.trim(),
      skillLevel: skillLevel.value,
    })
    message.value = 'Profile saved'
    router.push('/')
  } catch (e) {
    console.error(e)
    message.value = 'Error: ' + e.message
  }
}
</script>

<template>
  <v-container max-width="480">
    <h1 class="text-h5 mb-4">Your profile</h1>
    <v-text-field v-model="name" label="Name" />
    <v-select v-model="skillLevel" :items="[1, 2, 3, 4, 5]" label="Skill level (1-5)" />
    <v-btn color="primary" block @click="save">Save profile</v-btn>
    <v-alert v-if="message" type="success" class="mt-4">{{ message }}</v-alert>
  </v-container>
</template>