import { Column, TableList } from '@/components/utils'
import { OfficialType } from '@/types'

type OfficialTableListProps = {
 data?: OfficialType[]
 isLoading?: boolean
}

export const OfficialTableList = ({
 data,
 isLoading,
}: OfficialTableListProps) => {
 const columns: Column<OfficialType>[] = [
  { key: 'id', label: 'ID', width: 60, renderCell: (row) => row.id },
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
 ]
 //  console.log(data)
 return (
  <>
   <TableList<OfficialType>
    rowKey='id'
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
