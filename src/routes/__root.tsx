import { createRootRoute, Outlet, Navigate, useRouterState } from '@tanstack/react-router'
import { AppProvider } from '../lib/store'
import { Shell } from '../components/layout/Shell'
import { ToastHost } from '../components/ui'
import { useApp } from '../lib/store'
import { BuyWizard, AddAccountWizard, TopUpModal } from '../components/modals'
import { AutopayDrawer, ExportModal, HelpModal, HistoryDrawer, ModuleModal, RemoveModal, RenameModal, ReportModal, TariffModal, TxnDrawer } from '../components/dialogs'

function Dialogs() {
  return (
    <>
      <BuyWizard />
      <AddAccountWizard />
      <TopUpModal />
      <TxnDrawer />
      <HistoryDrawer />
      <ExportModal />
      <AutopayDrawer />
      <RenameModal />
      <RemoveModal />
      <ModuleModal />
      <HelpModal />
      <TariffModal />
      <ReportModal />
    </>
  )
}

function Root() {
  const { toasts, dismiss } = useApp()
  const pathname = useRouterState({ select: (st) => st.location.pathname })
  return (
    <Shell>
      {pathname === '/' ? <Navigate to="/utility" replace /> : <Outlet />}
      <Dialogs />
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </Shell>
  )
}

export const Route = createRootRoute({
  component: () => (
    <AppProvider>
      <Root />
    </AppProvider>
  ),
})
