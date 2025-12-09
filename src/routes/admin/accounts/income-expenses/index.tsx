import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/accounts/income-expenses/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/income-expenses/"!</div>
}
