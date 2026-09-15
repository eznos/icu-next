import { Column, TableList } from '@/components/utils'
import { OfficialType } from '@/types'
import { MdDelete, MdEdit } from 'react-icons/md'
type OfficialTableListProps = {
 data?: OfficialType[]
 isLoading?: boolean
 onRowClick?: (row: OfficialType, event: 'edit' | 'delete') => void
}

export const OfficialTableList = ({
 data,
 isLoading,
 onRowClick,
}: OfficialTableListProps) => {
 const columns: Column<OfficialType>[] = [
  { key: 'id', label: 'ID', width: 60, renderCell: (row) => row.objectUuId },
  {
   key: 'fullname',
   label: 'Name',
   width: 200,
   renderCell: (row) => row.fullName,
  },
  {
   key: 'age',
   label: 'Age',
   width: 150,
   renderCell: (row) => row.age,
  },
  {
   key: 'actions',
   label: 'Actions',
   width: 150,
   renderCell: (row) => (
    <div>
     <MdEdit
      size={18}
      style={{ cursor: 'pointer', marginRight: '8px' }}
      onClick={() => onRowClick?.(row, 'edit')}
     />
     <MdDelete
      size={18}
      style={{ cursor: 'pointer' }}
      onClick={() => onRowClick?.(row, 'delete')}
     />
    </div>
   ),
  },
 ]

 return (
  <>
   <TableList<OfficialType>
    rowKey='objectUuId'
    columns={columns}
    rows={data || []}
    pageSize={20}
    loading={isLoading}
    tableContainerProps={{
     sx: {
      maxHeight: 'calc(100vh - 300px)',
      overflowY: 'auto',
     },
    }}
    searchKeys={['fullName']}
    searchPlaceholder='Search users...'

    // onRowClick={(row) => console.log('Clicked:', row)}
   />
  </>
 )
}
