import { createFileRoute } from '@tanstack/react-router'
import { RecurringPage } from '../../features/utility-dashboard/recurring'

export const Route = createFileRoute('/utility/recurring')({
  component: RecurringPage,
})
