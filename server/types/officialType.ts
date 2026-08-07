export type OfficialType = {
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
 licenseExpiryDate: Date
 phoneNumber: string
 licenseDocumentUrl: string // เก็บ URL ของไฟล์ PDF
 createdAt: Date
 updatedAt: Date
}
