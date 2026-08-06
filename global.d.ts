// src/global.d.ts
type Messages = typeof import('./src/messages/en.json')

// declare global {
//  // บังคับให้ next-intl ใช้โครงสร้างจาก en.json เป็นมาตรฐาน
//  interface IntlMessages extends Messages {}
// }
declare interface IntlMessages extends Messages {}
