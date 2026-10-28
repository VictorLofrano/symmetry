import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { getUser } from './auth'

let hasProfile = false

export function setupGuard(router) {
  router.beforeEach(async (to) => {
    if (hasProfile) return true
    try {
      const user = await getUser()
      const snap = await getDoc(doc(db, 'users', user.uid))
      hasProfile = snap.exists()
    } catch (e) {
      console.error(e)
      return true
    }
    if (!hasProfile && to.path !== '/profile') return '/profile'
    return true
  })
}