export interface User {
    id: string
    username: string
    password: string
    role: 'admin' | 'user'
    createdAt: string
  }
  
  export interface UserPublic {
    id: string
    username: string
    role: 'admin' | 'user'
  }