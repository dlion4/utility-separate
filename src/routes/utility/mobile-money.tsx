import { createFileRoute } from '@tanstack/react-router'
import { MobileMoneyPage } from '../../features/utility-dashboard/mobile-money'

export const Route = createFileRoute('/utility/mobile-money')({
  component: MobileMoneyPage,
})
