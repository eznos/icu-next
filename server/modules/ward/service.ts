import { Ward } from './model'

const DEFAULT_WARDS = [
 {
  code: 'MICU3',
  name: 'หอผู้ป่วยวิกฤตอายุรกรรม 3 (MICU 3)',
  description: 'Medical Intensive Care Unit 3',
  totalBeds: 10,
  targetMonthlyAdmissions: 18,
  isActive: true,
 },
 {
  code: 'SICU',
  name: 'หอผู้ป่วยวิกฤตศัลยกรรม (SICU)',
  description: 'Surgical Intensive Care Unit',
  totalBeds: 10,
  targetMonthlyAdmissions: 18,
  isActive: true,
 },
 {
  code: 'CCU',
  name: 'หอผู้ป่วยวิกฤตโรคหัวใจ (CCU)',
  description: 'Coronary Care Unit',
  totalBeds: 10,
  targetMonthlyAdmissions: 18,
  isActive: true,
 },
 {
  code: 'NEURO_ICU',
  name: 'หอผู้ป่วยวิกฤตระบบประสาท (Neuro ICU)',
  description: 'Neurointensive Care Unit',
  totalBeds: 10,
  targetMonthlyAdmissions: 18,
  isActive: true,
 },
 {
  code: 'PICU',
  name: 'หอผู้ป่วยวิกฤตเด็ก (PICU)',
  description: 'Pediatric Intensive Care Unit',
  totalBeds: 10,
  targetMonthlyAdmissions: 18,
  isActive: true,
 },
]

export const wardService = {
 async getWardList(includeInactive = false) {
  const count = await Ward.countDocuments()
  if (count === 0) {
   await Ward.insertMany(DEFAULT_WARDS)
  }

  const filter = includeInactive ? {} : { isActive: true }
  const wards = await Ward.find(filter).sort({ code: 1 }).lean()
  return wards.map((w: any) => ({
   _id: w._id?.toString(),
   code: w.code,
   name: w.name,
   description: w.description || '',
   totalBeds: w.totalBeds ?? 10,
   targetMonthlyAdmissions: w.targetMonthlyAdmissions ?? 18,
   isActive: Boolean(w.isActive),
  }))
 },

 async getWardByCode(code: string) {
  const upperCode = (code || 'MICU3').toUpperCase().trim()
  const ward: any = await Ward.findOne({ code: upperCode }).lean()

  if (ward) {
   return {
    code: ward.code,
    name: ward.name,
    totalBeds: ward.totalBeds ?? 10,
    targetMonthlyAdmissions: ward.targetMonthlyAdmissions ?? 18,
   }
  }

  return {
   code: upperCode,
   name: `หอผู้ป่วยวิกฤต ${upperCode}`,
   totalBeds: 10,
   targetMonthlyAdmissions: 18,
  }
 },

 async createWard(payload: {
  code: string
  name: string
  description?: string
  totalBeds?: number
  targetMonthlyAdmissions?: number
 }) {
  const code = payload.code.toUpperCase().trim()
  const existing = await Ward.findOne({ code })
  if (existing) {
   throw new Error(`รหัส Ward "${code}" มีอยู่ในระบบแล้ว`)
  }

  const ward = new Ward({
   code,
   name: payload.name.trim(),
   description: payload.description?.trim() || '',
   totalBeds: Math.max(1, Number(payload.totalBeds) || 10),
   targetMonthlyAdmissions: Math.max(0, Number(payload.targetMonthlyAdmissions) || 18),
   isActive: true,
  })

  await ward.save()
  return {
   _id: ward._id.toString(),
   code: ward.code,
   name: ward.name,
   description: ward.description,
   totalBeds: ward.totalBeds,
   targetMonthlyAdmissions: ward.targetMonthlyAdmissions,
   isActive: ward.isActive,
  }
 },

 async updateWard(
  id: string,
  payload: {
   name?: string
   description?: string
   totalBeds?: number
   targetMonthlyAdmissions?: number
   isActive?: boolean
  },
 ) {
  const ward = await Ward.findById(id)
  if (!ward) {
   throw new Error('ไม่พบข้อมูล Ward ในระบบ')
  }

  if (payload.name !== undefined) ward.name = payload.name.trim()
  if (payload.description !== undefined) ward.description = payload.description.trim()
  if (payload.totalBeds !== undefined) ward.totalBeds = Math.max(1, Number(payload.totalBeds))
  if (payload.targetMonthlyAdmissions !== undefined) {
   ward.targetMonthlyAdmissions = Math.max(0, Number(payload.targetMonthlyAdmissions))
  }
  if (payload.isActive !== undefined) ward.isActive = payload.isActive

  await ward.save()
  return {
   _id: ward._id.toString(),
   code: ward.code,
   name: ward.name,
   description: ward.description,
   totalBeds: ward.totalBeds,
   targetMonthlyAdmissions: ward.targetMonthlyAdmissions,
   isActive: ward.isActive,
  }
 },

 async deleteWard(id: string) {
  const ward = await Ward.findById(id)
  if (!ward) {
   throw new Error('ไม่พบข้อมูล Ward ในระบบ')
  }

  ward.isActive = false
  await ward.save()
  return { success: true }
 },
}
