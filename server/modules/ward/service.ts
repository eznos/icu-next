import { Ward } from './model'

const DEFAULT_WARDS = [
 {
  code: 'MICU3',
  name: 'หอผู้ป่วยวิกฤตอายุรกรรม 3 (MICU 3)',
  description: 'Medical Intensive Care Unit 3',
  isActive: true,
 },
 {
  code: 'SICU',
  name: 'หอผู้ป่วยวิกฤตศัลยกรรม (SICU)',
  description: 'Surgical Intensive Care Unit',
  isActive: true,
 },
 {
  code: 'CCU',
  name: 'หอผู้ป่วยวิกฤตโรคหัวใจ (CCU)',
  description: 'Coronary Care Unit',
  isActive: true,
 },
 {
  code: 'NEURO_ICU',
  name: 'หอผู้ป่วยวิกฤตระบบประสาท (Neuro ICU)',
  description: 'Neurointensive Care Unit',
  isActive: true,
 },
 {
  code: 'PICU',
  name: 'หอผู้ป่วยวิกฤตเด็ก (PICU)',
  description: 'Pediatric Intensive Care Unit',
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
   isActive: Boolean(w.isActive),
  }))
 },
}
