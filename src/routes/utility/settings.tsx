import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '../../features/utility-dashboard/settings'

export const Route = createFileRoute('/utility/settings')({
  component: SettingsPage,
})
