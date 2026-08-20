import { createFileRoute } from '@tanstack/react-router'
import { ElectricityPage } from '../../features/utility-dashboard/electricity'

export const Route = createFileRoute('/utility/electricity')({
  component: ElectricityPage,
})
