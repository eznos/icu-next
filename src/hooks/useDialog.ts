import { useState, useCallback } from "react"

export const useDialog = <T = undefined>(initialOpen = false) => {
    const [open, setOpen] = useState(initialOpen)
    const [data, setData] = useState<T | undefined>(undefined)

    const openDialog = useCallback((payload?: T) => {
        setData(payload)
        setOpen(true)
    }, [])

    const closeDialog = useCallback(() => {
        setOpen(false)
        setData(undefined)
    }, [])

    const toggleDialog = useCallback(() => setOpen((prev) => !prev), [])

    return { open, data, openDialog, closeDialog, toggleDialog }
}
