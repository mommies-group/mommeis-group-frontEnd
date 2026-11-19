export type AuthSpecialist = {
  id: string
  email: string
  fullName: string
  specialty: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  specialist: AuthSpecialist
}
