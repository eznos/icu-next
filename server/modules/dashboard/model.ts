import { Static, t } from 'elysia'

export const WardInfoSchema = t.Object({
 code: t.String({ description: 'รหัส Ward เช่น MICU3' }),
 name: t.String({ description: 'ชื่อเต็มของ Ward' }),
 totalBeds: t.Number({ description: 'จำนวนเตียงทั้งหมดของ Ward' }),
})

export const DashboardSummarySchema = t.Object({
 totalPersonnel: t.Number({ description: 'บุคลากรพยาบาลทั้งหมด' }),
 activePatients: t.Number({ description: 'ผู้ป่วยกำลังรักษา' }),
 availableBeds: t.Number({ description: 'เตียงว่าง ณ ปัจจุบัน' }),
 pendingAdmissions: t.Optional(t.Number({ description: 'รอรับเข้า' })),
 satisfactionScore: t.Number({ description: 'คะแนนความพึงพอใจเฉลี่ย (เต็ม 5)' }),
})

export const BedPatientSchema = t.Object({
 _id: t.Optional(t.String()),
 objectUuId: t.Optional(t.String()),
 hn: t.String(),
 an: t.String(),
 patientName: t.String(),
 diagnosis: t.String(),
 attendingDoctor: t.String(),
 admissionType: t.String(),
 admissionDate: t.String(),
})

export const BedMappingItemSchema = t.Object({
 bedIndex: t.Number({ description: 'ลำดับหมายเลขเตียง (1-N)' }),
 bedNumber: t.String({ description: 'ชื่อเตียง เช่น เตียง 1 หรือ เตียงที่ 1' }),
 status: t.Union([t.Literal('Available'), t.Literal('Occupied')], {
  description: 'สถานะเตียง: Available (ว่าง), Occupied (มีคนไข้)',
 }),
 patient: t.Optional(t.Union([BedPatientSchema, t.Null()])),
})

export const MonthlyAdmissionsItemSchema = t.Object({
 month: t.Number({ description: 'เดือน (1-12)' }),
 label: t.String({ description: 'ชื่อย่อเดือนภาษาไทย เช่น ม.ค., ก.พ.' }),
 count: t.Number({ description: 'จำนวนผู้ป่วยรับเข้าจริงในเดือนนั้น' }),
})

export const MonthlyAdmissionsSchema = t.Object({
 yearBe: t.Number({ description: 'ปี พ.ศ. เช่น 2569' }),
 yearCe: t.Number({ description: 'ปี ค.ศ. เช่น 2026' }),
 target: t.Number({ description: 'ขีดจำกัดเป้าหมายเตียงการพยาบาล' }),
 data: t.Array(MonthlyAdmissionsItemSchema),
})

export const AdmissionTypeStatsSchema = t.Object({
 admit: t.Number({ description: 'รับใหม่ (Admit)' }),
 transfer: t.Number({ description: 'รับย้าย (Transfer)' }),
 refer: t.Number({ description: 'Fast Track (Refer)' }),
 total: t.Number({ description: 'ยอดรวมทุกประเภท' }),
})

export const DashboardDataSchema = t.Object({
 ward: WardInfoSchema,
 summary: DashboardSummarySchema,
 bedMapping: t.Array(BedMappingItemSchema),
 monthlyAdmissions: MonthlyAdmissionsSchema,
 admissionTypeStats: AdmissionTypeStatsSchema,
})

export const DashboardResponseSchema = t.Object({
 data: DashboardDataSchema,
 message: t.String(),
 statusCode: t.Number(),
})

export type DashboardDataType = Static<typeof DashboardDataSchema>
