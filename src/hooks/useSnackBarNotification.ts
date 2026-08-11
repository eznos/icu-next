import { useSnackbar as useNotistackSnackbar } from 'notistack'
import { useCallback } from 'react'

export const useSnackBarNotification = () => {
 const { enqueueSnackbar, closeSnackbar } = useNotistackSnackbar()

 // รวบเป็นฟังก์ชันเดียว รับค่า message, variant และ duration (ค่าเริ่มต้น 3000ms)
 const showSnackbar = useCallback(
  (
   message: string,
   variant: 'default' | 'error' | 'success' | 'warning' | 'info' = 'default',
   duration = 3000,
  ) => {
   enqueueSnackbar(message, {
    variant: variant,
    autoHideDuration: duration,
   })
  },
  [enqueueSnackbar],
 )

 return {
  showSnackbar,
  closeSnackbar,
 }
}
