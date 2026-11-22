import useSWR from 'swr'
import { getAuthHeaders } from '../authHelper'

export type KpiItem = {
 code: string
 tag?: string
 title: string
 targetDescription?: string
 targetValue: number
 actualValue: number
 unit: string
 progressPercent: number
 isPassed: boolean
 statusText: string
 statusColor: string
 numerator?: string
 denominator?: string
 multiplier?: number
 operator?: string
 isActive?: boolean
}

export type KpiStats = {
 totalPatients: number
 activePatients: number
 totalPatientDays: number
 estimatedVentilatorDays: number
 bedOccupancyPercent: number
 evaluationYearBe: number
 rawMetrics?: Record<string, number>
}

export type KpiRecord = {
 _id: string
 objectUuId: string
 ward: string
 periodType: 'yearly' | 'monthly'
 year: number
 month?: number | null
 title: string
 subtitle?: string
 items: KpiItem[]
 stats?: KpiStats
 createdAt?: string
 updatedAt?: string
}

export type KpiListResponse = {
 data: KpiRecord[]
 stats?: KpiStats
 message: string
 statusCode: number
 pagination?: {
  page: number
  limit: number
  totalPages: number
  totalItems: number
 }
}

export type MetricDefinition = {
 key: string
 label: string
 unit: string
 category: string
}

export async function fetchKpiData(ward?: string): Promise<KpiListResponse> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const query =
  ward && ward.toUpperCase() !== 'DASHBOARD'
   ? `?ward=${encodeURIComponent(ward)}`
   : ''

 const response = await fetch(`${apiBase}/api/kpi${query}`, {
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงข้อมูล KPI ไม่สำเร็จ')
 }

 return response.json()
}

export function useKpiData(ward: string = 'MICU3') {
 const cleanWard = ward && ward.toUpperCase() !== 'DASHBOARD' ? ward : 'MICU3'
 return useSWR<KpiListResponse>(
  ['kpi-data', cleanWard],
  () => fetchKpiData(cleanWard),
  {
   revalidateOnFocus: true,
   revalidateOnReconnect: true,
  },
 )
}

export async function updateWardKpi(
 ward: string,
 items: KpiItem[],
): Promise<{ data: KpiRecord; message: string }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(
  `${apiBase}/api/kpi/ward/${encodeURIComponent(ward)}`,
  {
   method: 'PUT',
   headers: getAuthHeaders(),
   body: JSON.stringify({ items }),
  },
 )

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'บันทึกการตั้งค่า KPI ไม่สำเร็จ')
 }

 return response.json()
}

export const AVAILABLE_METRIC_DEFINITIONS: MetricDefinition[] = [
 { key: 'vapCount', label: 'จำนวนติดเชื้อ VAP', unit: 'ครั้ง', category: 'การติดเชื้อ' },
 { key: 'clabsiCount', label: 'จำนวนติดเชื้อ CLABSI', unit: 'ครั้ง', category: 'การติดเชื้อ' },
 { key: 'cautiCount', label: 'จำนวนติดเชื้อ CAUTI', unit: 'ครั้ง', category: 'การติดเชื้อ' },
 { key: 'unplannedExtubations', label: 'จำนวนท่อช่วยหายใจเลื่อนหลุด', unit: 'ครั้ง', category: 'ความปลอดภัย' },
 { key: 'pressureUlcerCases', label: 'จำนวนแผลกดทับ Stage 2 ขึ้นไป', unit: 'ราย', category: 'ความปลอดภัย' },
 { key: 'medErrorCases', label: 'จำนวน Medication Error Grade E+ ขึ้นไป', unit: 'ครั้ง', category: 'ความปลอดภัย' },
 { key: 'deceasedCount', label: 'จำนวนผู้ป่วยเสียชีวิต (Deceased Patients)', unit: 'คน', category: 'ผลลัพธ์ทางคลินิก' },
 { key: 'readmittedCount', label: 'จำนวนผู้ป่วยกลับเข้า ICU ซ้ำใน 48 ชม.', unit: 'คน', category: 'การบริหารเตียง' },
 { key: 'activePatientsCount', label: 'ผู้ป่วยครองเตียงปัจจุบัน (Active Patients)', unit: 'คน', category: 'การบริหารเตียง' },
 { key: 'totalPatients', label: 'จำนวนผู้ป่วยสะสมทั้งหมด (Total Patients)', unit: 'คน', category: 'ข้อมูลทั่วไป' },
 { key: 'dischargedCount', label: 'ผู้ป่วยจำหน่ายสะสม (Discharged Patients)', unit: 'คน', category: 'ข้อมูลทั่วไป' },
 { key: 'totalPatientDays', label: 'วันนอนสะสม (Patient-Days)', unit: 'วัน', category: 'ข้อมูลทั่วไป' },
 { key: 'ventilatorDays', label: 'วันใช้เครื่องช่วยหายใจ (Ventilator-Days)', unit: 'วัน', category: 'อุปกรณ์การแพทย์' },
 { key: 'centralLineDays', label: 'วันใส่สาย Central Line (Device-Days)', unit: 'วัน', category: 'อุปกรณ์การแพทย์' },
 { key: 'catheterDays', label: 'วันใส่สาย Foley Catheter (Device-Days)', unit: 'วัน', category: 'อุปกรณ์การแพทย์' },
 { key: 'totalBeds', label: 'จำนวนเตียงทั้งหมดของ Ward (Total Beds)', unit: 'เตียง', category: 'การบริหารเตียง' },
]

export const AVAILABLE_DENOMINATOR_OPTIONS = [
 { key: 'none', label: 'ไม่มีตัวหาร (คำนวณจากตัวตั้งตรงๆ)' },
 { key: 'totalPatientDays', label: 'วันนอนสะสม (Patient-Days)' },
 { key: 'ventilatorDays', label: 'วันใช้เครื่องช่วยหายใจ (Ventilator-Days)' },
 { key: 'centralLineDays', label: 'วันใส่สาย Central Line (Device-Days)' },
 { key: 'catheterDays', label: 'วันใส่สาย Foley Catheter (Device-Days)' },
 { key: 'totalPatients', label: 'จำนวนผู้ป่วยทั้งหมด (Total Patients)' },
 { key: 'dischargedCount', label: 'ผู้ป่วยจำหน่ายแล้ว (Discharged Patients)' },
 { key: 'totalBeds', label: 'จำนวนเตียงทั้งหมด (Total Beds)' },
]
