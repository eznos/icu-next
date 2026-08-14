/**
 * TableList Component - Reusable, Extensible Table with Global Search, Sorting, Column Visibility & Pagination
 *
 * @example
 * ```tsx
 * import { TableList } from './TableList'
 *
 * type User = { id: string; name: string; email: string; status: 'active' | 'inactive' }
 *
 * function UserTable({ users }: { users: User[] }) {
 *   return (
 *     <TableList<User>
 *       rows={users}
 *       columns={[
 *         { key: 'name', label: 'Name', sortable: true },
 *         { key: 'email', label: 'Email', sortable: true },
 *         {
 *           key: 'status',
 *           label: 'Status',
 *           sortable: true,
 *           renderCell: (row) => (
 *             <Chip label={row.status} color={row.status === 'active' ? 'success' : 'default'} />
 *           ),
 *         },
 *         {
 *           key: 'id',
 *           label: 'Actions',
 *           renderCell: (row) => (
 *             <Box sx={{ display: 'flex', gap: 1 }}>
 *               <IconButton size="small" onClick={() => handleEdit(row)}>
 *                 <EditIcon />
 *               </IconButton>
 *               <IconButton size="small" onClick={() => handleDelete(row)}>
 *                 <DeleteIcon />
 *               </IconButton>
 *             </Box>
 *           ),
 *         },
 *       ]}
 *       rowKey="id"
 *       pageSize={10}
 *       searchPlaceholder="Search users..."
 *       onRowClick={(row) => console.log('Clicked:', row)}
 *     />
 *   )
 * }
 * ```
 */

import { useMemo, useState } from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import {
 Box,
 Card,
 Checkbox,
 CircularProgress,
 FormControlLabel,
 IconButton,
 Popover,
 Stack,
 Table,
 TableBody,
 TableCell,
 TableContainer,
 TableHead,
 TableRow,
 TableSortLabel,
 TextField,
 Typography,
 useTheme,
} from '@mui/material'

import type { SxProps, Theme } from '@mui/material'
import type { ReactNode } from 'react'

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a single column definition in the table.
 * Generic over the row type T to ensure type-safe column keys.
 */
export type Column<T extends Record<string, unknown>> = {
 /** Unique key matching a property of T or custom render-only column */
 key: string
 /** Display label for the column header */
 label: ReactNode
 /** Whether this column is sortable. Default: false */
 sortable?: boolean
 /** Whether this column is hidden by default. Default: false */
 hidden?: boolean
 /** Custom render function for the cell. If not provided, displays row[key] */
 renderCell?: (row: T) => ReactNode
 /** Text alignment for cells. Default: 'inherit' */
 align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
 /** Text alignment for header cells. Default: 'inherit' */
 headerAlign?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
 /** Optional fixed width for the column (e.g., '100px', '20%') */
 width?: string | number
 /** Optional MUI sx styles to apply to header and data cells */
 sx?: Record<string, unknown>
 sticky?: boolean // Whether the column should be sticky (requires width)
}

/**
 * Configuration for the TableList component.
 * Fully generic to support any row type T.
 */
type TableListProps<T extends Record<string, unknown>> = {
 /** Array of row data to display */
 rows: T[]
 /** Array of column definitions */
 columns: Column<T>[]
 /** Unique identifier for each row. Can be a key path or function. */
 rowKey: keyof T | ((row: T) => string)
 /** Whether data is currently loading. Shows spinner overlay. Default: false */
 loading?: boolean
 /** Rows per page for pagination. Default: 10 */
 pageSize?: number
 /** Options for rows per page dropdown. Default: [5, 10, 25, 50] */
 pageSizeOptions?: number[]
 /** Placeholder text for the search input field */
 searchPlaceholder?: string
 /** Message shown when table has no data. Default: 'No data available' */
 searchKeys?: (keyof T)[]
 emptyMessage?: string
 /** Called when a row is clicked. Disabled if not provided. */
 onRowClick?: (row: T) => void
 /** Optional MUI sx props for the root Box container */
 sx?: SxProps<Theme>
 /** Optional props to pass to TableContainer */
 tableContainerProps?: Record<string, unknown>
 /** Optional ReactNode slot for custom toolbar actions (e.g., buttons next to search) */
 toolbarActions?: ReactNode
 footer?: ReactNode
 /** Optional title for the table */
 title?: ReactNode
 /** Whether to hide the search input field. Default: false */
 hideSearch?: boolean
}

/**
 * Internal hook managing all TableList state and logic.
 * Returns derived state and event handlers for the component.
 */
type UseTableListReturn<T extends Record<string, unknown>> = {
 // State
 search: string
 sortKey: string | null
 sortDir: 'asc' | 'desc'
 page: number
 rowsPerPage: number
 hiddenColumns: Set<string>
 // Derived
 filteredAndSortedRows: T[]
 displayRows: T[]
 rowCount: number
 // Handlers
 handleSearchChange: (value: string) => void
 handleSort: (key: string) => void
 handleToggleColumn: (key: string) => void
 handlePageChange: (
  event: React.MouseEvent<HTMLButtonElement> | null,
  newPage: number,
 ) => void
 handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
 // Popover state
 settingsAnchor: HTMLButtonElement | null
 handleSettingsOpen: (event: React.MouseEvent<HTMLButtonElement>) => void
 handleSettingsClose: () => void
}

// ============================================================================
// Hook: useTableList
// ============================================================================

function useTableList<T extends Record<string, unknown>>(
 rows: T[],
 columns: Column<T>[],
 searchKeys?: (keyof T)[],
 pageSize: number = 10,
): UseTableListReturn<T> {
 // Search & Filter
 const [search, setSearch] = useState('')

 // Sorting
 const [sortKey, setSortKey] = useState<string | null>(null)
 const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

 // Pagination
 const [page, setPage] = useState(0)
 const [rowsPerPage, setRowsPerPage] = useState(pageSize)

 // Column Visibility
 const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
  return new Set(columns.filter((col) => col.hidden).map((col) => col.key))
 })

 // Settings Popover
 const [settingsAnchor, setSettingsAnchor] = useState<HTMLButtonElement | null>(
  null,
 )

 // --------- Filtering ---------
 const filteredAndSortedRows = useMemo(() => {
  let result = [...rows]

  // 1. Apply search filter (case-insensitive, shallow search across visible columns)
  if (search.trim()) {
   const searchLower = search.toLowerCase()
   result = result.filter((row) => {
    return (
     searchKeys?.some((key) => {
      const value = row[key]
      return String(value).toLowerCase().includes(searchLower)
     }) ?? false
    )
   })
  }

  // 2. Apply sorting
  if (sortKey) {
   result.sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return sortDir === 'asc' ? 1 : -1
    if (bVal == null) return sortDir === 'asc' ? -1 : 1

    // Basic comparison (works for strings, numbers, dates)
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
   })
  }
  return result
 }, [rows, search, sortKey, sortDir, columns])

 // --------- Pagination ---------
 const displayRows = useMemo(() => {
  const startIndex = page * rowsPerPage
  return filteredAndSortedRows.slice(startIndex, startIndex + rowsPerPage)
 }, [filteredAndSortedRows, page, rowsPerPage])

 // --------- Handlers ---------
 const handleSearchChange = (value: string) => {
  setSearch(value)
  setPage(0) // Reset to first page on search
 }

 const handleSort = (key: string) => {
  if (sortKey === key) {
   // Toggle direction if clicking same column
   setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
  } else {
   // New column, start with asc
   setSortKey(key)
   setSortDir('asc')
  }
  setPage(0) // Reset to first page on sort change
 }

 const handleToggleColumn = (key: string) => {
  const newHidden = new Set(hiddenColumns)
  if (newHidden.has(key)) {
   newHidden.delete(key)
  } else {
   newHidden.add(key)
  }
  setHiddenColumns(newHidden)
 }

 const handlePageChange = (
  _: React.MouseEvent<HTMLButtonElement> | null,
  newPage: number,
 ) => {
  setPage(newPage)
 }

 const handleRowsPerPageChange = (
  event: React.ChangeEvent<HTMLInputElement>,
 ) => {
  setRowsPerPage(parseInt(event.target.value, 10))
  setPage(0) // Reset to first page when changing page size
 }

 const handleSettingsOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
  setSettingsAnchor(event.currentTarget)
 }

 const handleSettingsClose = () => {
  setSettingsAnchor(null)
 }

 return {
  search,
  sortKey,
  sortDir,
  page,
  rowsPerPage,
  hiddenColumns,
  filteredAndSortedRows,
  displayRows,
  rowCount: filteredAndSortedRows.length,
  handleSearchChange,
  handleSort,
  handleToggleColumn,
  handlePageChange,
  handleRowsPerPageChange,
  settingsAnchor,
  handleSettingsOpen,
  handleSettingsClose,
 }
}
// ============================================================================
// Component: TableList
// ============================================================================

export function TableList<T extends Record<string, unknown>>({
 rows,
 columns,
 rowKey,
 loading = false,
 pageSize = 10,
 searchPlaceholder = 'Search...',
 emptyMessage = 'No data available',
 onRowClick,
 sx,
 tableContainerProps,
 toolbarActions,
 footer,
 title,
 hideSearch = false,
 searchKeys = [],
}: TableListProps<T>) {
 const theme = useTheme()

 const getRowKey = (row: T): string => {
  if (typeof rowKey === 'function') {
   return rowKey(row)
  }
  return String(row[rowKey])
 }

 const {
  search,
  sortKey,
  sortDir,
  hiddenColumns,
  displayRows,
  handleSearchChange,
  handleSort,
  handleToggleColumn,
  settingsAnchor,
  handleSettingsOpen,
  handleSettingsClose,
 } = useTableList(rows, columns, searchKeys, pageSize)

 const settingsOpen = Boolean(settingsAnchor)
 const settingsId = settingsOpen ? 'column-settings-popover' : undefined

 // Visible columns
 const visibleColumns = columns.filter((col) => !hiddenColumns.has(col.key))

 // 🌟 [เพิ่มใหม่] คำนวณระยะ left สำหรับ Sticky Columns
 const stickyLeftPositions: Record<string, number> = {}
 let currentLeft = 0
 visibleColumns.forEach((col) => {
  if (col.sticky) {
   stickyLeftPositions[col.key] = currentLeft
   // ดึงตัวเลขจาก width มาบวกเพิ่ม (รองรับทั้งแบบ number และ string เช่น '100px')
   const widthVal =
    typeof col.width === 'number'
     ? col.width
     : parseInt(String(col.width).replace(/[^0-9]/g, ''), 10) || 0
   currentLeft += widthVal
  }
 })

 return (
  <Box
   sx={{
    ...sx,
    '& .MuiTableCell-root': {
     borderBottom: `1px solid #d5d7dc`,
    },
    height: '200px',
   }}
  >
   {/* ===== TOOLBAR ===== */}
   <Box
    sx={{
     display: 'flex',
     gap: 2,
     alignItems: 'center',
     marginBottom: 2,
     flexWrap: 'wrap',
    }}
   >
    {title && title}
    {!hideSearch && (
     <TextField
      size='small'
      placeholder={searchPlaceholder}
      value={search}
      onChange={(e) => handleSearchChange(e.target.value)}
      sx={{ flex: { xs: '1 1 250px' }, minWidth: '200px' }}
     />
    )}
    {toolbarActions}
    <IconButton
     size='small'
     onClick={handleSettingsOpen}
     aria-describedby={settingsId}
     sx={{ ml: hideSearch ? 'auto' : 0 }}
    >
     <SettingsIcon />
    </IconButton>
   </Box>

   {/* ===== COLUMN VISIBILITY POPOVER ===== */}
   <Popover
    id={settingsId}
    open={settingsOpen}
    anchorEl={settingsAnchor}
    onClose={handleSettingsClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
   >
    <Box sx={{ p: 2, minWidth: '200px' }}>
     <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
      Show/Hide Columns
     </Typography>
     {columns
      ?.filter((col) => col.key !== 'action')
      .map((col) => (
       <FormControlLabel
        key={col.key}
        control={
         <Checkbox
          checked={!hiddenColumns.has(col.key)}
          onChange={() => handleToggleColumn(col.key)}
          size='small'
         />
        }
        label={col.label}
        sx={{ display: 'block', mb: 0.5 }}
       />
      ))}
    </Box>
   </Popover>

   {/* ===== TABLE ===== */}
   <Card
    variant='outlined'
    sx={{
     p: 1,
     borderRadius: 2,
     // height: '100%',
     display: 'flex',
     flexDirection: 'column',
     // minHeight: '300px',
     overflow: 'hidden',
    }}
   >
    <TableContainer
     sx={{ overflowX: 'auto', maxHeight: { xs: 400, md: 600 } }}
     {...tableContainerProps}
    >
     <Box sx={{ position: 'relative', height: '100%' }}>
      <Table sx={{ minWidth: 350 }} aria-label='data table' stickyHeader>
       {/* TABLE HEAD */}
       <TableHead>
        <TableRow>
         {visibleColumns.map((col) => (
          <TableCell
           key={col.key}
           align={col.headerAlign || 'inherit'}
           width={col.width}
           sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            bgcolor: 'background.paper',
            ...(col.sticky && {
             position: 'sticky',
             left: stickyLeftPositions[col.key] || 0,
             bgcolor: 'background.paper', // บังคับใส่สีพื้นหลังไม่ให้ทะลุ
             zIndex: 3, // ให้อยู่บนสุดเหนือเนื้อหาปกติ
             boxShadow: '1px 0 0 0 rgba(0,0,0,0.05)', // ใส่เส้นขอบบางๆ ด้านขวา
            }),
            ...col.sx,
           }}
          >
           {col.sortable ? (
            <TableSortLabel
             active={sortKey === col.key}
             direction={sortKey === col.key ? sortDir : 'asc'}
             onClick={() => handleSort(col.key)}
            >
             {col.label}
            </TableSortLabel>
           ) : (
            col.label
           )}
          </TableCell>
         ))}
        </TableRow>
       </TableHead>

       {/* TABLE BODY */}
       <TableBody>
        {loading ? (
         <TableRow>
          <TableCell
           colSpan={visibleColumns.length}
           align='center'
           sx={{ py: 12, borderBottom: 'none' }} // เพิ่ม py ให้กล่องดูใหญ่ขึ้น
          >
           <Stack
            sx={{
             alignItems: 'center',
            }}
            spacing={2.5}
           >
            <CircularProgress
             size={42}
             thickness={4}
             sx={{
              color: 'primary.main',
             }}
            />
            <Typography
             sx={{
              fontSize: 18,
              fontWeight: 600,
              color: 'text.secondary',
              // เพิ่ม Animation กระพริบเบาๆ (Pulse)
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
               '0%': { opacity: 0.6 },
               '25%': { opacity: 0.8 },
               '50%': { opacity: 1 },
               '75%': { opacity: 0.8 },
               '100%': { opacity: 0.6 },
              },
             }}
            >
             กำลังรวบรวมข้อมูล...
            </Typography>
           </Stack>
          </TableCell>
         </TableRow>
        ) : displayRows.length === 0 ? (
         <TableRow>
          <TableCell
           colSpan={visibleColumns.length}
           align='center'
           sx={{ py: 3 }}
          >
           <Typography variant='body2' color='text.secondary'>
            {emptyMessage}
           </Typography>
          </TableCell>
         </TableRow>
        ) : (
         displayRows.map((row) => {
          return (
           <TableRow
            key={getRowKey(row)}
            onClick={() => onRowClick?.(row)}
            sx={{
             cursor: onRowClick ? 'pointer' : 'default',
             '&:hover': onRowClick ? { bgcolor: '#f5f5f5' } : {},
            }}
           >
            {visibleColumns.map((col) => {
             return (
              <TableCell
               key={col.key}
               align={col.align || 'inherit'}
               sx={{
                minWidth: col.width,
                // maxWidth: Number(col.width),
                // 🌟 [เพิ่มใหม่] ตั้งค่า Sticky ให้ Data Cell
                flexShrink: 0, // ป้องกันไม่ให้ Cell หดตัวเมื่อมี Scroll
                ...(col.sticky && {
                 position: 'sticky',
                 left: stickyLeftPositions[col.key] || 0,
                 bgcolor: 'background.paper',
                 zIndex: 1, // ให้อยู่เหนือ Cell ปกติ แต่ต่ำกว่า Header
                 boxShadow: '1px 0 0 0 rgba(0,0,0,0.05)',
                 // โค้ดรักษา Hover Effect ให้กับ Cell ที่ถูกตรึง
                 '.MuiTableRow-root:hover &': onRowClick
                  ? { bgcolor: '#f5f5f5' }
                  : {},
                }),
                ...col.sx,
               }}
              >
               {col.renderCell
                ? col.renderCell(row)
                : String(row[col.key] ?? '')}
              </TableCell>
             )
            })}
           </TableRow>
          )
         })
        )}
       </TableBody>
      </Table>
     </Box>
    </TableContainer>
    {footer && (
     <Box sx={{ bgcolor: 'background.paper', zIndex: 10 }}>{footer}</Box>
    )}
   </Card>
  </Box>
 )
}
