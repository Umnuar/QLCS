import { AppProvider, useApp } from "./AppContext";
import { AppLayout } from "./components/Layout/AppLayout";
import { ToastProvider } from "./components/common/Toast";
import { ModalProvider } from "./hooks/useModal";
import AnalyticsPage from "./pages/AnalyticsPage";
import AuditLogPage from "./pages/AuditLogPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RecycleBinPage from "./pages/RecycleBinPage";
import Settings from "./pages/Settings";
import VillagesPage from "./pages/VillagesPage";
import "./index.css";

function MainContent() {
	const { user, isInitializing, activeTab } = useApp();

	if (isInitializing) {
		return (
			<div className="min-h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white select-none">
				<div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
				<div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
					Đang khởi tạo hệ thống QLCS...
				</div>
			</div>
		);
	}

	if (!user) {
		return <Login />;
	}

	return (
		<AppLayout>
			{activeTab === "villages" && <VillagesPage />}
			{activeTab === "chuctho" && <Dashboard tabOverride="chuctho" />}
			{activeTab === "htxh" && <Dashboard tabOverride="htxh" />}
			{activeTab === "analytics" && <AnalyticsPage />}
			{activeTab === "recycle-bin" && <RecycleBinPage />}
			{activeTab === "audit" && <AuditLogPage />}
			{activeTab === "settings" && <Settings />}
		</AppLayout>
	);
}

export function App() {
	return (
		<AppProvider>
			<ToastProvider>
				<ModalProvider>
					<MainContent />
				</ModalProvider>
			</ToastProvider>
		</AppProvider>
	);
}

export default App;
