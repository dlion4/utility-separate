import { createFileRoute } from '@tanstack/react-router'
import { WaterPage } from '../../features/utility-dashboard/water'

export const Route = createFileRoute('/utility/water')({
  component: WaterPage,
})
