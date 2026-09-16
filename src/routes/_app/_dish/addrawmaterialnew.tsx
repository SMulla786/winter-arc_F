import AddRawMaterialNew from '@/pages/AddRawMaterialNew'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_dish/addrawmaterialnew')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AddRawMaterialNew />
}
