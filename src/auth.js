import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

export function getUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      if (user) return resolve(user)
      try {
        const cred = await signInAnonymously(auth)
        resolve(cred.user)
      } catch (e) {
        reject(e)
      }
    })
  })
}