export interface GuestEnrollmentInput {
  courseId: string | number
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface GuestEnrollmentPayload {
  courseId: number
  authPayload: {
    firstName: string
    lastName: string
    email: string
    password: string
  }
}

export function buildGuestEnrollmentPayload(values: GuestEnrollmentInput): GuestEnrollmentPayload
