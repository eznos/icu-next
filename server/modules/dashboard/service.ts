import { CurrentUser } from '../../auth.setup'
import { Official } from '../official/service'
import { Patient } from '../patient/model'
import { wardService } from '../ward/service'
import { DashboardDataType } from './model'

const THAI_MONTH_LABELS = [
 'ม.ค.',
 'ก.พ.',
 'มี.ค.',
 'เม.ย.',
 'พ.ค.',
 'มิ.ย.',
 'ก.ค.',
 'ส.ค.',
 'ก.ย.',
 'ต.ค.',
 'พ.ย.',
 'ธ.ค.',
]

export const dashboardService = {
 async getDashboardData({
  requestedWard,
  currentUser,
 }: {
  requestedWard?: string
  currentUser?: CurrentUser | null
 }): Promise<DashboardDataType> {
  const cleanRequestedWard =
   requestedWard && requestedWard.toUpperCase() !== 'DASHBOARD'
    ? requestedWard.toUpperCase()
    : undefined

  const targetWard =
   currentUser && currentUser.role !== 'admin'
    ? currentUser.ward || 'MICU3'
    : cleanRequestedWard || currentUser?.ward || 'MICU3'

  const wardConfig = await wardService.getWardByCode(targetWard)
  const totalBeds = wardConfig.totalBeds ?? 10
  const targetMonthlyAdmissions = wardConfig.targetMonthlyAdmissions ?? 18

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

  const [totalPersonnel, activePatientsDocs, allWardPatients] = await Promise.all([
   Official.countDocuments({ isDeleted: { $ne: true } }),
   Patient.find({ ...wardQuery, status: 'admitted' }).lean(),
   Patient.find(wardQuery).lean(),
  ])

  const activePatients = activePatientsDocs.length
  const availableBeds = Math.max(0, totalBeds - activePatients)
  const satisfactionScore = 5.0

  const activeBedMap = new Map<number, any>()
  for (const patient of activePatientsDocs) {
   const match = (patient.bedNumber || '').match(/\d+/)
   if (match) {
    const bedIndex = parseInt(match[0], 10)
    if (!activeBedMap.has(bedIndex)) {
     activeBedMap.set(bedIndex, patient)
    }
   }
  }

  const bedMapping = Array.from({ length: totalBeds }, (_, idx) => {
   const bedIndex = idx + 1
   const patient = activeBedMap.get(bedIndex)

   if (patient) {
    return {
     bedIndex,
     bedNumber: `เตียง ${bedIndex}`,
     status: 'Occupied' as const,
     patient: {
      _id: patient._id?.toString(),
      objectUuId: patient.objectUuId || patient._id?.toString(),
      hn: patient.hn || '',
      an: patient.an || '',
      patientName: patient.patientName || '',
      diagnosis: patient.diagnosis || '',
      attendingDoctor: patient.attendingDoctor || '',
      admissionType: patient.admissionType || 'admit',
      admissionDate: patient.admissionDate
       ? new Date(patient.admissionDate).toISOString()
       : '',
     },
    }
   }

   return {
    bedIndex,
    bedNumber: `เตียง ${bedIndex}`,
    status: 'Available' as const,
    patient: null,
   }
  })

  const now = new Date()
  const currentYear = now.getFullYear()
  const yearBe = currentYear + 543
  const monthlyCounts = Array(12).fill(0)

  let admitCount = 0
  let transferCount = 0
  let referCount = 0

  for (const patient of allWardPatients) {
   if (patient.admissionDate) {
    const admissionDate = new Date(patient.admissionDate)
    if (admissionDate.getFullYear() === currentYear) {
     const monthIdx = admissionDate.getMonth()
     if (monthIdx >= 0 && monthIdx < 12) {
      monthlyCounts[monthIdx] += 1
     }
    }
   }

   if (patient.admissionType === 'transfer') {
    transferCount += 1
   } else if (patient.admissionType === 'refer') {
    referCount += 1
   } else {
    admitCount += 1
   }
  }

  const monthlyAdmissions = {
   yearBe,
   yearCe: currentYear,
   target: targetMonthlyAdmissions,
   data: THAI_MONTH_LABELS.map((label, index) => ({
    month: index + 1,
    label,
    count: monthlyCounts[index],
   })),
  }

  const admissionTypeStats = {
   admit: admitCount,
   transfer: transferCount,
   refer: referCount,
   total: allWardPatients.length,
  }

  return {
   ward: {
    code: wardConfig.code,
    name: wardConfig.name,
    totalBeds,
   },
   summary: {
    totalPersonnel,
    activePatients,
    availableBeds,
    pendingAdmissions: 0,
    satisfactionScore,
   },
   bedMapping,
   monthlyAdmissions,
   admissionTypeStats,
  }
 },
}
