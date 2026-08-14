export type OfficialType = {
 id?: string
 fullName: string
 age: number
 gender: 'ชาย' | 'หญิง' | 'อื่นๆ'
 position: string
 competencyLevel:
  | 'Novice'
  | 'Advanced Beginner'
  | 'Competent'
  | 'Proficient'
  | 'Expert'
 licenseNumber: string
 licenseExpiryDate: string
 phoneNumber: string
 licenseDocumentUrl: string
 createdAt?: string
 updatedAt?: string
}
