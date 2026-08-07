// // import { env } from '@/config/env';
// // import { tokenStorage } from '@/lib/token-storage';
// import axios from 'axios'
// // import qs from 'qs';

// // สร้างตัวแปรไว้เก็บสถานะว่ากำลังขอ Token ใหม่กระบุงอยู่หรือไม่
// let isRefreshing = false
// // คิวสำหรับเก็บ Request ที่เจอ 401 ระหว่างที่กำลังรอ Token ใหม่
// let failedQueue: Array<{
//  resolve: (token: string) => void
//  reject: (err: any) => void
// }> = []

// const processQueue = (error: any, token: string | null = null) => {
//  failedQueue.forEach((prom) => {
//   if (error) {
//    prom.reject(error)
//   } else if (token) {
//    prom.resolve(token)
//   }
//  })
//  failedQueue = []
// }

// const createApiClient = (baseURL: string) => {
//  const client = axios.create({
//   baseURL,
//   headers: {
//    'Content-Type': 'application/json',
//   },
//   timeout: 10_000,
//   // paramsSerializer: {
//   //   serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
//   // },
//  })

//  // Interceptor ขาไป
//  client.interceptors.request.use(
//   (config) => {
//    const token = tokenStorage.getToken()
//    if (token) {
//     config.headers['Authorization'] = `Bearer ${token}`
//    }
//    return config
//   },
//   (error) => Promise.reject(error),
//  )

//  // Interceptor ขากลับ
//  client.interceptors.response.use(
//   (response) => {
//    return response
//   },
//   async (error) => {
//    // ดึง config ของ Request เดิมที่เพิ่งพังไป
//    const originalRequest = error.config

//    // ถ้าพังเพราะ 401 และยังไม่ได้ลอง retry
//    if (
//     error.response &&
//     error.response.status === 401 &&
//     !originalRequest._retry
//    ) {
//     // ถ้ากำลังขอ Token ใหม่อยู่แล้ว ให้เอา Request นี้ไปต่อคิวรอ
//     if (isRefreshing) {
//      return new Promise((resolve, reject) => {
//       failedQueue.push({ resolve, reject })
//      })
//       .then((token) => {
//        originalRequest.headers['Authorization'] = `Bearer ${token}`
//        return client(originalRequest)
//       })
//       .catch((err) => {
//        return Promise.reject(err)
//       })
//     }

//     // มาร์คว่า Request นี้กำลังจะลอง retry
//     originalRequest._retry = true
//     isRefreshing = true

//     const oldToken = tokenStorage.getRefreshToken()

//     try {
//      const refreshResponse: {
//       data: {
//        access_token: string
//        expires_in: number
//        refresh_token: string
//        token_type: string
//       }
//      } = await axios.post(`${env.BASE_URL_AUTH}auth/refresh`, {
//       refresh_token: oldToken,
//      })
//      const newToken = refreshResponse.data.access_token
//      tokenStorage.setToken(newToken)
//      tokenStorage.setRefreshToken(refreshResponse.data.refresh_token)
//      processQueue(null, newToken)

//      // 3. เปลี่ยน Header ของ Request เดิมแล้วยิงใหม่
//      originalRequest.headers['Authorization'] = `Bearer ${newToken}`
//      return client(originalRequest)
//     } catch (refreshError) {
//      // ถ้าการขอ Token ใหม่ล้มเหลว (เช่น oldToken หมดอายุถาวร)
//      processQueue(refreshError, null)

//      // ล้าง Token ทิ้งแล้วเตะไปหน้า Login
//      // tokenStorage.removeToken();
//      window.location.href = '/login'

//      return Promise.reject(refreshError)
//     } finally {
//      // รีเซ็ตสถานะกลับเป็นปกติ
//      isRefreshing = false
//     }
//    }

//    return Promise.reject(error)
//   },
//  )

//  return client
// }

// export const apiClient = createApiClient(env.BASE_URL)
// export const apiClientAuth = createApiClient(env.BASE_URL_AUTH)
