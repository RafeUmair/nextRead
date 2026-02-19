import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signup = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName: name,
      email: email,
      createdAt: Date.now(),
    })
    return cred
  }

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider())
    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName: cred.user.displayName,
      email: cred.user.email,
      createdAt: Date.now(),
    }, { merge: true })
    return cred
  }

  const loginWithGithub = async () => {
    const cred = await signInWithPopup(auth, new GithubAuthProvider())
    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName: cred.user.displayName,
      email: cred.user.email,
      createdAt: Date.now(),
    }, { merge: true })
    return cred
  }

  return (
    <AuthContext.Provider value={{
      user, loading, signup, login, logout,
      resetPassword, loginWithGoogle, loginWithGithub
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
