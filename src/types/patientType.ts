export type AdmissionType = 'admit' | 'transfer' | 'refer'
export type PatientStatus = 'admitted' | 'discharged'

 export type PatientType = {
 _id?: string
 objectUuId?: string
 bedNumber: string
 hn: string
 an: string
 admissionType: AdmissionType
 patientName: string
 diagnosis: string
 attendingDoctor: string
 hometown: string
 admissionDate: string
 status: PatientStatus
 ward?: string
 isDeleted?: boolean
 deletedAt?: string | null
 createdAt?: string
 updatedAt?: string
}

export type CreatePatientPayload = {
 bedNumber: string
 hn: string
 an: string
 admissionType: AdmissionType
 patientName: string
 diagnosis: string
 attendingDoctor: string
 hometown: string
 admissionDate: string
 status: PatientStatus
 ward?: string
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>

export type PatientQueryParams = {
 limit?: number
 page?: number
 searchQuery?: string
 statusFilter?: string
 ward?: string
 sortBy?: string
 order?: 'asc' | 'desc'
}
