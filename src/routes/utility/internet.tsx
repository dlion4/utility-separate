import { createFileRoute } from '@tanstack/react-router'
import { InternetPage } from '../../features/utility-dashboard/internet'

export const Route = createFileRoute('/utility/internet')({
  component: InternetPage,
})
