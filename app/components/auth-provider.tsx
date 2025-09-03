
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  profile?: {
    bio?: string
    joinDate: string
    coursesCompleted: number
    certificatesEarned: string[]
    friends: string[]
    skillLevel: string
    preferredSubjects: string[]
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (updatedUser: User) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || firebaseUser.displayName || '',
              avatar_url: userData.avatar_url || firebaseUser.photoURL || '',
              profile: userData.profile
            })
          } else {
            // Create new user document if it doesn't exist
            const newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              avatar_url: firebaseUser.photoURL || '',
              profile: {
                bio: '',
                joinDate: new Date().toISOString(),
                coursesCompleted: 0,
                certificatesEarned: [],
                friends: [],
                skillLevel: 'Beginner',
                preferredSubjects: []
              }
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser)
            setUser(newUser)
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
          // Fallback: create basic user from Firebase Auth
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            avatar_url: firebaseUser.photoURL || '',
            profile: {
              bio: '',
              joinDate: new Date().toISOString(),
              coursesCompleted: 0,
              certificatesEarned: [],
              friends: [],
              skillLevel: 'Beginner',
              preferredSubjects: []
            }
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await signInWithEmailAndPassword(auth, email, password)
      // User will be set by onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in Firestore
      const newUser = {
        id: result.user.uid,
        email: email,
        name: displayName,
        avatar_url: '',
        profile: {
          bio: '',
          joinDate: new Date().toISOString(),
          coursesCompleted: 0,
          certificatesEarned: [],
          friends: [],
          skillLevel: 'Beginner',
          preferredSubjects: []
        }
      }
      
      await setDoc(doc(db, 'users', result.user.uid), newUser)
      // User will be set by onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error: any) {
      throw new Error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updatedUser: User) => {
    try {
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', updatedUser.id), {
        name: updatedUser.name,
        avatar_url: updatedUser.avatar_url,
        profile: updatedUser.profile
      })
      setUser(updatedUser)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
