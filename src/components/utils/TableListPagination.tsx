import { TablePagination } from '@mui/material'

export const TableListPagination = ({
 totalItems,
 pageSize,
 currentPage,
 onPageChange,
 onRowsPerPageChange,
}: {
 totalItems: number
 pageSize: number
 currentPage: number
 onPageChange: (page: number) => void
 onRowsPerPageChange: (rowsPerPage: number) => void
}) => {
 return (
  <TablePagination
   component='div'
   count={totalItems}
   page={currentPage - 1}
   onPageChange={(_, newPage) => onPageChange(newPage + 1)}
   rowsPerPage={pageSize}
   onRowsPerPageChange={(event) =>
    onRowsPerPageChange(parseInt(event.target.value, 10))
   }
  />
 )
}
