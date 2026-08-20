import { ToastHost } from "./ui";
import { Shell } from "./Shell";
import { SettingsPage } from "./page36";
import { AddAccountWizard, BuyWizard, TopUpModal } from "./modals31";
import { AutopayDrawer, ExportModal, HelpModal, HistoryDrawer, ModuleModal, RemoveModal, RenameModal, ReportModal, TariffModal, TxnDrawer } from "./dialogs31";
import { AppProvider, useApp } from "./store";

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
  );
}

function Root() {
  const { toasts, dismiss } = useApp();
  return (
    <Shell>
      <SettingsPage />
      <Dialogs />
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </Shell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
