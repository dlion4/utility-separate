import { createFileRoute } from '@tanstack/react-router'
import { UtilitiesPage } from '../../features/utility-dashboard/overview'

export const Route = createFileRoute('/utility')({
  component: UtilitiesPage,
})
