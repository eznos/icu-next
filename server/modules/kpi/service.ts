import crypto from 'crypto'
import dayjs from 'dayjs'
import { status } from 'elysia'
import { Patient } from '../patient/model'
import { DailyAssessment } from '../assessment/model'
import { wardService } from '../ward/service'
import { CreateKpiType, IKpi, IKpiItem, Kpi, UpdateKpiType } from './model'

function processKpiItems(items: IKpiItem[]): IKpiItem[] {
 return items.map((item) => {
  let isPassed = item.isPassed
  if (typeof isPassed !== 'boolean') {
   isPassed = item.actualValue <= item.targetValue
  }

  let progressPercent = item.progressPercent
  if (typeof progressPercent !== 'number') {
   if (item.targetValue > 0) {
    progressPercent = Math.min(
     100,
     Math.max(0, Math.round((item.actualValue / item.targetValue) * 100)),
    )
   } else {
    progressPercent = item.actualValue === 0 ? 100 : 0
   }
  }

  let statusText = item.statusText
  if (!statusText) {
   statusText = isPassed
    ? 'ปลอดภัยและผ่านเกณฑ์การประเมิน'
    : 'เกินเกณฑ์มาตรฐานสากล'
  }

  let statusColor = item.statusColor
  if (!statusColor) {
   statusColor = isPassed ? 'success' : 'error'
  }

  return {
   ...item,
   progressPercent,
   isPassed,
   statusText,
   statusColor,
  }
 })
}

function formatKpiDoc(doc: any) {
 return {
  _id: doc._id?.toString(),
  objectUuId: doc.objectUuId,
  ward: doc.ward,
  periodType: doc.periodType,
  year: doc.year,
  month: typeof doc.month === 'number' ? doc.month : null,
  title: doc.title,
  subtitle: doc.subtitle || '',
  items: (doc.items || []).map((it: any) => ({
   code: it.code,
   tag: it.tag || 'มาตรฐานสำคัญ',
   title: it.title,
   targetDescription: it.targetDescription || '',
   targetValue: Number(it.targetValue) || 0,
   actualValue: Number(it.actualValue) || 0,
   unit: it.unit || '',
   progressPercent: Number(it.progressPercent) || 0,
   isPassed: Boolean(it.isPassed),
   statusText: it.statusText || '',
   statusColor: it.statusColor || 'success',
   numerator: it.numerator || undefined,
   denominator: it.denominator || undefined,
   multiplier: typeof it.multiplier === 'number' ? it.multiplier : 1,
   operator: it.operator || '<=',
   isActive: it.isActive !== false,
  })),
  stats: doc.stats || undefined,
  isDeleted: Boolean(doc.isDeleted),
  deletedAt: doc.deletedAt ? new Date(doc.deletedAt).toISOString() : null,
  createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
  updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
 }
}

async function calculateLiveKpi(
 targetWard: string = 'MICU3',
 yearBe: number = 2569,
) {
 const wardConfig = await wardService.getWardByCode(targetWard)
 const totalBeds = wardConfig.totalBeds ?? 10

 const wardQuery: any = { isDeleted: { $ne: true } }
 if (targetWard === 'MICU3') {
  wardQuery.$or = [
   { ward: 'MICU3' },
   { ward: { $exists: false } },
   { ward: null },
   { ward: '' },
  ]
 } else {
  wardQuery.ward = targetWard
 }

 const [allWardPatients, dailyAssessments] = await Promise.all([
  Patient.find(wardQuery).lean(),
  DailyAssessment.find({ ward: targetWard.toUpperCase() }).lean(),
 ])

 const activePatients = allWardPatients.filter(
  (p: any) => p.status === 'admitted',
 )
 const dischargedPatients = allWardPatients.filter(
  (p: any) => p.status === 'discharged',
 )
 const totalPatients = allWardPatients.length
 const activePatientsCount = activePatients.length

 // 1. วันนอนสะสม (Patient-Days)
 let totalPatientDays = 0
 for (const p of allWardPatients) {
  const start = p.admissionDate ? dayjs(p.admissionDate) : dayjs(p.createdAt)
  const end = p.dischargeDate ? dayjs(p.dischargeDate) : dayjs()
  const diffDays = Math.max(1, end.diff(start, 'day') + 1)
  totalPatientDays += diffDays
 }
 if (totalPatientDays === 0) totalPatientDays = Math.max(1, totalPatients * 5)

 // 2. Device-Days จาก Daily Assessment (นับ 1 คนต่อ 1 วัน = 1 Device-Day ตามเกณฑ์ CDC / NHSN)
 const ventPatientDays = new Set(
  dailyAssessments
   .filter((d: any) => d.hasVentilator)
   .map((d: any) => `${d.an}_${dayjs(d.recordDate).format('YYYY-MM-DD')}`),
 ).size

 const centralLinePatientDays = new Set(
  dailyAssessments
   .filter((d: any) => d.hasCentralLine)
   .map((d: any) => `${d.an}_${dayjs(d.recordDate).format('YYYY-MM-DD')}`),
 ).size

 const catheterPatientDays = new Set(
  dailyAssessments
   .filter((d: any) => d.hasFoleyCatheter)
   .map((d: any) => `${d.an}_${dayjs(d.recordDate).format('YYYY-MM-DD')}`),
 ).size

 const ventilatorDays =
  ventPatientDays > 0
   ? ventPatientDays
   : Math.max(1, Math.round(totalPatientDays * 0.6))

 const centralLineDays =
  centralLinePatientDays > 0
   ? centralLinePatientDays
   : Math.max(1, Math.round(totalPatientDays * 0.5))

 const catheterDays =
  catheterPatientDays > 0
   ? catheterPatientDays
   : Math.max(1, Math.round(totalPatientDays * 0.7))

 // 3. นับจำนวนการเกิดเหตุการณ์ (Events)
 const vapCount = dailyAssessments.filter((d: any) => d.hasVap).length
 const clabsiCount = dailyAssessments.filter((d: any) => d.hasClabsi).length
 const cautiCount = dailyAssessments.filter((d: any) => d.hasCauti).length
 const unplannedExtubations = dailyAssessments.reduce(
  (sum: number, d: any) => sum + (Number(d.unplannedExtubation) || 0),
  0,
 )
 const pressureUlcerCases = dailyAssessments.filter(
  (d: any) => d.pressureInjuryStage && d.pressureInjuryStage !== 'none',
 ).length
 const medErrorCases = dailyAssessments.reduce(
  (sum: number, d: any) => sum + (Number(d.medicationErrorGradeEUp) || 0),
  0,
 )

 // 4. คำนวณ Utilization & Flow KPIs
 const bedOccupancyPercent =
  totalBeds > 0
   ? Math.min(100, Math.round((activePatientsCount / totalBeds) * 100))
   : 0

 let totalDischargedDays = 0
 for (const p of dischargedPatients) {
  const start = p.admissionDate ? dayjs(p.admissionDate) : dayjs(p.createdAt)
  const end = p.dischargeDate ? dayjs(p.dischargeDate) : dayjs(p.updatedAt)
  totalDischargedDays += Math.max(1, end.diff(start, 'day') + 1)
 }
 const alos =
  dischargedPatients.length > 0
   ? Number((totalDischargedDays / dischargedPatients.length).toFixed(1))
   : Number((totalPatientDays / Math.max(1, totalPatients)).toFixed(1))

 const readmittedCount = allWardPatients.filter(
  (p: any) => p.isReadmission48h,
 ).length
 const wardTransfers = dischargedPatients.filter(
  (p: any) => p.dischargeReason === 'transferred_ward',
 ).length
 const readmissionRate =
  wardTransfers > 0
   ? Number(((readmittedCount / wardTransfers) * 100).toFixed(1))
   : readmittedCount > 0
     ? Number(
        (
         (readmittedCount / Math.max(1, dischargedPatients.length)) *
         100
        ).toFixed(1),
       )
     : 0

 // 5. คำนวณ Clinical Outcomes
 const deceasedCount = dischargedPatients.filter(
  (p: any) => p.dischargeReason === 'deceased',
 ).length
 const mortalityRate =
  dischargedPatients.length > 0
   ? Number(((deceasedCount / dischargedPatients.length) * 100).toFixed(1))
   : 0

 let totalExpectedDeaths = 0
 for (const p of allWardPatients) {
  const score = Number(p.apacheScore) || 12
  const expectedRisk = Math.min(
   0.95,
   Math.max(0.02, 1 / (1 + Math.exp(-(-3.5 + score * 0.15)))),
  )
  totalExpectedDeaths += expectedRisk
 }
 const smr =
  totalExpectedDeaths > 0
   ? Number((deceasedCount / totalExpectedDeaths).toFixed(2))
   : 0.85

 // 6. คำนวณ Device & Safety Rates
 const vapRate = Number(((vapCount / ventilatorDays) * 1000).toFixed(1))
 const clabsiRate = Number(((clabsiCount / centralLineDays) * 1000).toFixed(1))
 const cautiRate = Number(((cautiCount / catheterDays) * 1000).toFixed(1))
 const unplannedExtubationRate = Number(
  ((unplannedExtubations / ventilatorDays) * 1000).toFixed(1),
 )
 const pressureInjuryRate =
  totalPatients > 0
   ? Number(((pressureUlcerCases / totalPatients) * 100).toFixed(2))
   : 0
 const medErrorRate = Number(
  ((medErrorCases / totalPatientDays) * 1000).toFixed(2),
 )

 const stats = {
  totalPatients,
  activePatients: activePatientsCount,
  totalPatientDays,
  estimatedVentilatorDays: ventilatorDays,
  bedOccupancyPercent,
  evaluationYearBe: yearBe,
 }

 const items = [
  {
   code: 'BED_OCCUPANCY',
   tag: 'การบริหารเตียง',
   title: '1. อัตราการครองเตียง (Bed Occupancy Rate)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: 80% - 85%',
   targetValue: 85,
   actualValue: bedOccupancyPercent,
   unit: `${bedOccupancyPercent}%`,
   progressPercent: Math.min(100, bedOccupancyPercent),
   isPassed: bedOccupancyPercent <= 90,
   statusText:
    bedOccupancyPercent <= 90
     ? 'อัตราครองเตียงเหมาะสม'
     : 'ความจุเตียงหนาแน่นวิกฤต',
   statusColor: bedOccupancyPercent <= 90 ? 'success' : 'warning',
  },
  {
   code: 'ALOS',
   tag: 'การบริหารเตียง',
   title: '2. วันนอนเฉลี่ยใน ICU (Average Length of Stay: ALOS)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: < 5.0 วัน',
   targetValue: 5.0,
   actualValue: alos,
   unit: `${alos} วัน`,
   progressPercent: Math.min(100, Math.round((alos / 5.0) * 100)),
   isPassed: alos <= 5.0,
   statusText:
    alos <= 5.0
     ? 'การหมุนเวียนเตียงมีประสิทธิภาพ'
     : 'ผู้ป่วยนอนรักษาตัวยาวนานกว่าเกณฑ์',
   statusColor: alos <= 5.0 ? 'success' : 'warning',
  },
  {
   code: 'READMISSION_48H',
   tag: 'การบริหารเตียง',
   title: '3. อัตรากลับเข้า ICU ซ้ำภายใน 48 ชั่วโมง (Readmission Rate 48h)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: < 2.0%',
   targetValue: 2.0,
   actualValue: readmissionRate,
   unit: `${readmissionRate}%`,
   progressPercent: Math.min(100, Math.round((readmissionRate / 2.0) * 100)),
   isPassed: readmissionRate <= 2.0,
   statusText:
    readmissionRate <= 2.0
     ? 'ผ่านเกณฑ์ความพร้อมจำหน่าย'
     : 'เฝ้าระวังการย้ายกลับซ้ำ',
   statusColor: readmissionRate <= 2.0 ? 'success' : 'error',
  },
  {
   code: 'MORTALITY',
   tag: 'ผลลัพธ์ทางคลินิก',
   title: '4. อัตราการเสียชีวิตใน ICU (Crude ICU Mortality Rate)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: < 10.0%',
   targetValue: 10.0,
   actualValue: mortalityRate,
   unit: `${mortalityRate}%`,
   progressPercent: Math.min(100, Math.round((mortalityRate / 10.0) * 100)),
   isPassed: mortalityRate <= 10.0,
   statusText:
    mortalityRate <= 10.0 ? 'อยู่ในเกณฑ์ควบคุมคุณภาพ' : 'สูงกว่าเกณฑ์เฉลี่ย',
   statusColor: mortalityRate <= 10.0 ? 'success' : 'error',
  },
  {
   code: 'SMR',
   tag: 'ผลลัพธ์ทางคลินิก',
   title: '5. อัตราส่วนการเสียชีวิตมาตรฐาน (Standardized Mortality Ratio: SMR)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: SMR < 1.0 (อิง APACHE II Score)',
   targetValue: 1.0,
   actualValue: smr,
   unit: `${smr}`,
   progressPercent: Math.min(100, Math.round(smr * 100)),
   isPassed: smr < 1.0,
   statusText:
    smr < 1.0
     ? 'การรอดชีวิตดีกว่าเกณฑ์คาดการณ์ (Excellent)'
     : 'อัตราเสียชีวิตสูงกว่าเกณฑ์คาดการณ์',
   statusColor: smr < 1.0 ? 'success' : 'error',
  },
  {
   code: 'VAP',
   tag: 'การติดเชื้อใน รพ.',
   title: '6. อัตราเกิดการติดเชื้อปอดอักเสบจากเครื่องช่วยหายใจ (VAP Rate)',
   targetDescription:
    'เป้าหมายมาตรฐานสากล: < 2.5 ต่อ 1,000 วันเครื่องช่วยหายใจ',
   targetValue: 2.5,
   actualValue: vapRate,
   unit: `${vapRate} / 1,000 วัน`,
   progressPercent: Math.min(100, Math.round((vapRate / 2.5) * 100)),
   isPassed: vapRate < 2.5,
   statusText:
    vapRate < 2.5 ? 'ปลอดภัยและผ่านเกณฑ์การประเมิน' : 'เกินเกณฑ์มาตรฐานสากล',
   statusColor: vapRate < 2.5 ? 'success' : 'error',
  },
  {
   code: 'CLABSI',
   tag: 'การติดเชื้อใน รพ.',
   title:
    '7. การติดเชื้อในกระแสเลือดจากสายสวนหลอดเลือดดำส่วนกลาง (CLABSI Rate)',
   targetDescription:
    'เป้าหมายมาตรฐานสากล: < 1.5 ต่อ 1,000 วันสาย Central Line',
   targetValue: 1.5,
   actualValue: clabsiRate,
   unit: `${clabsiRate} / 1,000 วัน`,
   progressPercent: Math.min(100, Math.round((clabsiRate / 1.5) * 100)),
   isPassed: clabsiRate < 1.5,
   statusText:
    clabsiRate < 1.5 ? 'ปลอดการติดเชื้อในกระแสเลือด' : 'เกินเกณฑ์ควบคุม',
   statusColor: clabsiRate < 1.5 ? 'success' : 'error',
  },
  {
   code: 'CAUTI',
   tag: 'การติดเชื้อใน รพ.',
   title: '8. การติดเชื้อทางเดินปัสสาวะจากการคาสายสวน (CAUTI Rate)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: < 2.0 ต่อ 1,000 วันคาสายสวนปัสสาวะ',
   targetValue: 2.0,
   actualValue: cautiRate,
   unit: `${cautiRate} / 1,000 วัน`,
   progressPercent: Math.min(100, Math.round((cautiRate / 2.0) * 100)),
   isPassed: cautiRate < 2.0,
   statusText: cautiRate < 2.0 ? 'ปลอดภัยผ่านเกณฑ์' : 'เฝ้าระวังการติดเชื้อ',
   statusColor: cautiRate < 2.0 ? 'success' : 'error',
  },
  {
   code: 'UNPLANNED_EXTUBATION',
   tag: 'ความปลอดภัย',
   title:
    '9. อัตราการเลื่อนหลุดของท่อช่วยหายใจโดยไม่ได้วางแผน (Unplanned Extubation)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: < 2.0 ต่อ 1,000 วันใส่ท่อช่วยหายใจ',
   targetValue: 2.0,
   actualValue: unplannedExtubationRate,
   unit: `${unplannedExtubationRate} / 1,000 วัน`,
   progressPercent: Math.min(
    100,
    Math.round((unplannedExtubationRate / 2.0) * 100),
   ),
   isPassed: unplannedExtubationRate <= 2.0,
   statusText:
    unplannedExtubationRate <= 2.0
     ? 'การยึดตรึงท่อปลอดภัย'
     : 'พบอุบัติการณ์ท่อหลุดเกินเกณฑ์',
   statusColor: unplannedExtubationRate <= 2.0 ? 'success' : 'error',
  },
  {
   code: 'PRESSURE_INJURY',
   tag: 'ความปลอดภัย',
   title: '10. อัตราเกิดแผลกดทับระดับ 2 ขึ้นไปใน ICU (Pressure Injury Rate)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: 0% สำหรับระดับ 2 ขึ้นไป',
   targetValue: 0,
   actualValue: pressureInjuryRate,
   unit: `${pressureInjuryRate}%`,
   progressPercent: Math.min(100, Math.round(pressureInjuryRate * 100)),
   isPassed: pressureInjuryRate === 0,
   statusText:
    pressureInjuryRate === 0
     ? 'สถิติเป็นศูนย์ (Zero Harm)'
     : 'พบแผลกดทับเกิดใหม่',
   statusColor: pressureInjuryRate === 0 ? 'success' : 'error',
  },
  {
   code: 'MED_ERROR',
   tag: 'ความปลอดภัย',
   title: '11. ความคลาดเคลื่อนทางยาระดับ E ขึ้นไป (Medication Error Rate)',
   targetDescription: 'เป้าหมายมาตรฐานสากล: 0 ครั้งต่อ 1,000 วันนอน',
   targetValue: 0,
   actualValue: medErrorRate,
   unit: `${medErrorRate} / 1,000 วัน`,
   progressPercent: medErrorRate === 0 ? 100 : 0,
   isPassed: medErrorRate === 0,
   statusText:
    medErrorRate === 0
     ? 'สถิติเป็นศูนย์ (Zero Harm Completed)'
     : 'พบความคลาดเคลื่อนทางยา',
   statusColor: medErrorRate === 0 ? 'success' : 'error',
  },
 ]

 const rawMetrics: Record<string, number> = {
  totalPatients,
  activePatientsCount,
  dischargedCount: dischargedPatients.length,
  totalPatientDays,
  readmittedCount,
  deceasedCount,
  ventilatorDays,
  centralLineDays,
  catheterDays,
  vapCount,
  clabsiCount,
  cautiCount,
  unplannedExtubations,
  pressureUlcerCases,
  medErrorCases,
  totalBeds,
  bedOccupancyPercent,
  alos,
  readmissionRate,
  mortalityRate,
  smr,
  vapRate,
  clabsiRate,
  cautiRate,
  unplannedExtubationRate,
  pressureInjuryRate,
  medErrorRate,
 }

 const savedDoc: any = await Kpi.findOne({
  ward: targetWard.toUpperCase().trim(),
  isDeleted: { $ne: true },
 }).lean()

 let finalItems = items.map((it) => ({ ...it, isActive: true }))
 if (savedDoc && Array.isArray(savedDoc.items) && savedDoc.items.length > 0) {
  finalItems = savedDoc.items.map((savedItem: any) => {
   if (savedItem.numerator) {
    const num = rawMetrics[savedItem.numerator] ?? 0
    const den =
     savedItem.denominator && savedItem.denominator !== 'none'
      ? rawMetrics[savedItem.denominator] ?? 0
      : null
    const mul = savedItem.multiplier || 1

    let actualValue = 0
    if (den !== null) {
     actualValue = den > 0 ? Number(((num / den) * mul).toFixed(2)) : 0
    } else {
     actualValue = Number((num * mul).toFixed(2))
    }

    const op = savedItem.operator || '<='
    const target = Number(savedItem.targetValue) || 0
    const isPassed = op === '>=' ? actualValue >= target : actualValue <= target
    const progressPercent =
     target > 0
      ? Math.min(100, Math.max(0, Math.round((actualValue / target) * 100)))
      : actualValue === 0
        ? 100
        : 0
    const statusText = isPassed ? 'ผ่านเกณฑ์เป้าหมาย' : 'ไม่ผ่านเกณฑ์เป้าหมาย'
    const statusColor = isPassed ? 'success' : 'error'

    return {
     code: savedItem.code,
     tag: savedItem.tag || 'Custom Metric',
     title: savedItem.title,
     targetDescription: savedItem.targetDescription || '',
     targetValue: target,
     actualValue,
     unit: savedItem.unit || '',
     progressPercent,
     isPassed,
     statusText: savedItem.statusText || statusText,
     statusColor: savedItem.statusColor || statusColor,
     numerator: savedItem.numerator,
     denominator: savedItem.denominator,
     multiplier: mul,
     operator: op,
     isActive: savedItem.isActive !== false,
    }
   }

   const std = items.find((it) => it.code === savedItem.code)
   if (std) {
    const target =
     typeof savedItem.targetValue === 'number'
      ? savedItem.targetValue
      : std.targetValue
    const isPassed =
     savedItem.operator === '>='
      ? std.actualValue >= target
      : std.actualValue <= target

    return {
     ...std,
     title: savedItem.title || std.title,
     tag: savedItem.tag || std.tag,
     targetDescription: savedItem.targetDescription || std.targetDescription,
     targetValue: target,
     isPassed,
     isActive: savedItem.isActive !== false,
    }
   }

   return savedItem
  })
 }

 const liveKpiDoc = {
  _id: savedDoc?._id?.toString() || '6addd5df52520f44cc25b001',
  objectUuId: savedDoc?.objectUuId || crypto.randomUUID(),
  ward: targetWard,
  periodType: 'yearly' as const,
  year: yearBe,
  month: null,
  title: savedDoc?.title || `ตัวชี้วัดคุณภาพ ICU (${targetWard} Quality KPIs)`,
  subtitle:
   savedDoc?.subtitle ||
   'คำนวณจากข้อมูลผู้ป่วยและการประเมินเตียงรายวันตามเกณฑ์มาตรฐานสากล CDC / HA',
  items: finalItems,
  stats: {
   ...stats,
   rawMetrics,
  },
  isDeleted: false,
  deletedAt: null,
  createdAt: savedDoc?.createdAt
   ? new Date(savedDoc.createdAt).toISOString()
   : new Date().toISOString(),
  updatedAt: new Date().toISOString(),
 }

 return {
  kpiDoc: liveKpiDoc,
  stats: {
   ...stats,
   rawMetrics,
  },
 }
}

export abstract class kpiService {
 static async createKpi(body: CreateKpiType) {
  try {
   const processedItems = processKpiItems(body.items as IKpiItem[])

   const newKpi = new Kpi({
    objectUuId: crypto.randomUUID(),
    ward: (body.ward || 'MICU3').toUpperCase().trim(),
    periodType: body.periodType,
    year: body.year,
    month: body.month ?? null,
    title: body.title.trim(),
    subtitle: body.subtitle ? body.subtitle.trim() : '',
    items: processedItems,
    isDeleted: false,
    deletedAt: null,
   })

   await newKpi.save()

   return {
    data: formatKpiDoc(newKpi.toObject()),
    message: 'สร้างข้อมูล KPI สำเร็จ',
    statusCode: 201,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message || 'สร้างข้อมูล KPI ไม่สำเร็จ',
    message: 'เกิดข้อผิดพลาดในการสร้าง KPI',
    statusCode: 400,
   })
  }
 }

 static async getKpiList({
  query,
 }: {
  query?: {
   ward?: string
   year?: string
   periodType?: 'yearly' | 'monthly'
   month?: string
   page?: string
   limit?: string
  }
 }) {
  const limit = Math.max(1, Number(query?.limit) || 20)
  const page = Math.max(1, Number(query?.page) || 1)
  const skip = (page - 1) * limit
  const targetWard =
   query?.ward && query.ward.toUpperCase() !== 'DASHBOARD'
    ? query.ward.toUpperCase().trim()
    : 'MICU3'
  const targetYear = Number(query?.year) || 2569

  try {
   const filterQuery: any = { isDeleted: { $ne: true } }

   if (query?.ward && query.ward.toUpperCase() !== 'DASHBOARD') {
    filterQuery.ward = query.ward.toUpperCase().trim()
   }

   if (query?.year) {
    filterQuery.year = Number(query.year)
   }

   if (query?.periodType) {
    filterQuery.periodType = query.periodType
   }

   if (query?.month) {
    filterQuery.month = Number(query.month)
   }

   const [docs, totalItems] = await Promise.all([
    Kpi.find(filterQuery)
     .sort({ year: -1, month: -1, createdAt: -1 })
     .skip(skip)
     .limit(limit)
     .lean(),
    Kpi.countDocuments(filterQuery),
   ])

   const liveResult = await calculateLiveKpi(targetWard, targetYear)

   if (docs.length === 0) {
    return {
     data: [liveResult.kpiDoc],
     stats: liveResult.stats,
     pagination: {
      page: 1,
      limit,
      totalPages: 1,
      totalItems: 1,
     },
     message: 'คำนวณและดึงข้อมูล KPI สำเร็จ (Auto-calculated Live Data)',
     statusCode: 200,
    }
   }

   const formattedList = docs.map((doc: any) => {
    const formatted = formatKpiDoc(doc)
    const mergedItems = (formatted.items || []).map((it: any) => {
     const liveItem = liveResult.kpiDoc.items.find((l) => l.code === it.code)
     return {
      ...liveItem,
      ...it,
      title: it.title || liveItem?.title || it.code,
      tag: it.tag || liveItem?.tag || 'มาตรฐานสำคัญ',
      targetDescription:
       it.targetDescription || liveItem?.targetDescription || '',
      actualValue: it.actualValue ?? liveItem?.actualValue ?? 0,
      unit: it.unit || liveItem?.unit || '',
      isPassed: typeof it.isPassed === 'boolean' ? it.isPassed : liveItem?.isPassed ?? true,
      isActive: it.isActive !== false,
     }
    })

    return {
     ...formatted,
     items: mergedItems.length > 0 ? mergedItems : liveResult.kpiDoc.items,
    }
   })

   return {
    data: formattedList,
    stats: liveResult.stats,
    pagination: {
     page,
     limit,
     totalPages: Math.ceil(totalItems / limit) || 1,
     totalItems,
    },
    message: 'ดึงข้อมูล KPI สำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message,
    message: 'ดึงข้อมูล KPI ไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }

 static async getKpiDetail({ id }: { id: string }) {
  try {
   if (id.startsWith('live-kpi-')) {
    const ward = id.replace('live-kpi-', '').toUpperCase() || 'MICU3'
    const live = await calculateLiveKpi(ward)
    return {
     data: live.kpiDoc,
     message: 'ดึงข้อมูล KPI สำเร็จ (Live Data)',
     statusCode: 200,
    }
   }

   const query: any = { isDeleted: { $ne: true } }
   if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query.$or = [{ _id: id }, { objectUuId: id }]
   } else {
    query.objectUuId = id
   }

   const doc = await Kpi.findOne(query).lean()
   if (!doc) {
    const live = await calculateLiveKpi()
    return {
     data: live.kpiDoc,
     message: 'ดึงข้อมูล KPI สำเร็จ (Fallback Live Data)',
     statusCode: 200,
    }
   }

   return {
    data: formatKpiDoc(doc),
    message: 'ดึงข้อมูล KPI สำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงข้อมูล KPI ไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async updateKpi({ id, body }: { id: string; body: UpdateKpiType }) {
  try {
   const query: any = { isDeleted: { $ne: true } }
   if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query.$or = [{ _id: id }, { objectUuId: id }]
   } else {
    query.objectUuId = id
   }

   const existing = await Kpi.findOne(query)
   if (!existing) {
    return status(404, {
     error: 'KPI not found',
     message: 'ไม่พบข้อมูล KPI ที่ต้องการอัปเดต',
     statusCode: 404,
    })
   }

   const updateData: any = {}
   if (body.ward) updateData.ward = body.ward.toUpperCase().trim()
   if (body.periodType) updateData.periodType = body.periodType
   if (body.year) updateData.year = body.year
   if (body.month !== undefined) updateData.month = body.month ?? null
   if (body.title) updateData.title = body.title.trim()
   if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
   if (body.items) {
    updateData.items = processKpiItems(body.items as IKpiItem[])
   }

   await Kpi.updateOne(query, { $set: updateData })

   const updated = await Kpi.findOne(query).lean()

   return {
    data: formatKpiDoc(updated),
    message: 'อัปเดตข้อมูล KPI สำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message || 'Update failed',
    message: 'อัปเดตข้อมูล KPI ไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }

 static async deleteKpi({ id }: { id: string }) {
  try {
   const query: any = { isDeleted: { $ne: true } }
   if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query.$or = [{ _id: id }, { objectUuId: id }]
   } else {
    query.objectUuId = id
   }

   const existing = await Kpi.findOne(query)
   if (!existing) {
    return status(404, {
     error: 'KPI not found',
     message: 'ไม่พบข้อมูล KPI ที่ต้องการลบ',
     statusCode: 404,
    })
   }

   await Kpi.updateOne(query, {
    $set: {
     isDeleted: true,
     deletedAt: new Date(),
    },
   })

   return {
    message: 'ลบข้อมูล KPI สำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Delete failed',
    message: 'ลบข้อมูล KPI ไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async updateWardKpiItems({
  ward,
  items,
 }: {
  ward: string
  items: IKpiItem[]
 }) {
  try {
   const upperWard = (ward || 'MICU3').toUpperCase().trim()
   const yearBe = 2569

   let doc: any = await Kpi.findOne({
    ward: upperWard,
    isDeleted: { $ne: true },
   })

   if (!doc) {
    doc = new Kpi({
     objectUuId: crypto.randomUUID(),
     ward: upperWard,
     periodType: 'yearly',
     year: yearBe,
     title: `ตัวชี้วัดคุณภาพ ICU (${upperWard} Quality KPIs)`,
     subtitle:
      'คำนวณจากข้อมูลผู้ป่วยและการประเมินเตียงรายวันตามเกณฑ์มาตรฐานสากล CDC / HA',
     items,
    })
   } else {
    doc.items = items
   }

   await doc.save()

   const liveResult = await calculateLiveKpi(upperWard, yearBe)
   return {
    data: liveResult.kpiDoc,
    stats: liveResult.stats,
    message: 'บันทึกการตั้งค่าตัวชี้วัด (KPI) สำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Update failed',
    message: 'บันทึกการตั้งค่า KPI ไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static getAvailableMetrics() {
  return [
   { key: 'vapCount', label: 'จำนวนติดเชื้อ VAP (ครั้ง)', unit: 'ครั้ง', category: 'การติดเชื้อ' },
   { key: 'clabsiCount', label: 'จำนวนติดเชื้อ CLABSI (ครั้ง)', unit: 'ครั้ง', category: 'การติดเชื้อ' },
   { key: 'cautiCount', label: 'จำนวนติดเชื้อ CAUTI (ครั้ง)', unit: 'ครั้ง', category: 'การติดเชื้อ' },
   { key: 'unplannedExtubations', label: 'จำนวนท่อช่วยหายใจเลื่อนหลุด (ครั้ง)', unit: 'ครั้ง', category: 'ความปลอดภัย' },
   { key: 'pressureUlcerCases', label: 'จำนวนแผลกดทับ Stage 2+ (ราย)', unit: 'ราย', category: 'ความปลอดภัย' },
   { key: 'medErrorCases', label: 'จำนวน Medication Error Grade E+ (ครั้ง)', unit: 'ครั้ง', category: 'ความปลอดภัย' },
   { key: 'deceasedCount', label: 'ผู้ป่วยเสียชีวิต (Deceased Patients)', unit: 'คน', category: 'ผลลัพธ์ทางคลินิก' },
   { key: 'readmittedCount', label: 'ผู้ป่วยกลับเข้า ICU ซ้ำใน 48 ชม.', unit: 'คน', category: 'การบริหารเตียง' },
   { key: 'activePatientsCount', label: 'ผู้ป่วยครองเตียงปัจจุบัน (Active Patients)', unit: 'คน', category: 'การบริหารเตียง' },
   { key: 'totalPatients', label: 'จำนวนผู้ป่วยสะสมทั้งหมด (Total Patients)', unit: 'คน', category: 'ทั่วไป' },
   { key: 'dischargedCount', label: 'ผู้ป่วยจำหน่ายสะสม (Discharged Patients)', unit: 'คน', category: 'ทั่วไป' },
   { key: 'totalPatientDays', label: 'วันนอนสะสม (Patient-Days)', unit: 'วัน', category: 'ทั่วไป' },
   { key: 'ventilatorDays', label: 'วันใช้เครื่องช่วยหายใจ (Ventilator-Days)', unit: 'วัน', category: 'อุปกรณ์' },
   { key: 'centralLineDays', label: 'วันใส่สาย Central Line (Device-Days)', unit: 'วัน', category: 'อุปกรณ์' },
   { key: 'catheterDays', label: 'วันใส่สาย Foley Catheter (Device-Days)', unit: 'วัน', category: 'อุปกรณ์' },
   { key: 'totalBeds', label: 'จำนวนเตียงทั้งหมดของ Ward (Beds)', unit: 'เตียง', category: 'การบริหารเตียง' },
  ]
 }
}
