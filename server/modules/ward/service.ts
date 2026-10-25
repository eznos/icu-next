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
 async getWardList() {
  const count = await Ward.countDocuments()
  if (count === 0) {
   await Ward.insertMany(DEFAULT_WARDS)
  }

  const wards = await Ward.find({ isActive: true }).sort({ code: 1 }).lean()
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
}
