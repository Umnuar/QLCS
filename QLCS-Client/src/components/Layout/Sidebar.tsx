import {
	Award,
	BarChart3,
	Database,
	History,
	Map,
	PanelLeftClose,
	PanelLeftOpen,
	Settings as SettingsIcon,
	ShieldCheck,
	Trash2,
	Users,
} from "lucide-react";
import type React from "react";
import { type ActiveTab, useApp } from "../../AppContext";

interface NavItem {
	id: ActiveTab;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	desc: string;
	badge?: string;
	adminOnly?: boolean;
}

export const Sidebar: React.FC = () => {
	const {
		activeTab,
		setActiveTab,
		user,
		isSidebarCollapsed,
		toggleSidebar,
		setSidebarCollapsed,
		selectedVillageId,
		selectedVillageName,
		setSelectedVillageId,
	} = useApp();

	const isAdmin = user?.role === "admin";

	let visibleItems: NavItem[] = [];

	if (isAdmin) {
		visibleItems.push({
			id: "villages",
			label: "Quản Lý Thôn",
			icon: Map,
			desc: selectedVillageId
				? "← Đổi thôn làm việc"
				: "Quản lý các thôn xã Đăk Hà",
		});

		if (selectedVillageId) {
			visibleItems.push(
				{
					id: "analytics",
					label: "Thống Kê",
					icon: BarChart3,
					desc: `Báo cáo số liệu ${selectedVillageName || "thôn"}`,
					badge: "Chính",
				},
				{
					id: "chuctho",
					label: "Hồ Sơ Chúc Thọ",
					icon: Award,
					desc: "Chính sách chúc thọ người cao tuổi",
				},
				{
					id: "htxh",
					label: "Hưu Trí Xã Hội",
					icon: Users,
					desc: "Trợ cấp hưu trí xã hội các diện",
				},
			);
		} else if (activeTab === "analytics") {
			visibleItems.push({
				id: "analytics",
				label: "Thống Kê",
				icon: BarChart3,
				desc: "Tổng hợp số liệu toàn xã",
				badge: "Toàn Xã",
			});
		}

		visibleItems.push(
			{
				id: "recycle-bin",
				label: "Thùng Rác",
				icon: Trash2,
				desc: "Quản lý hồ sơ đã xóa",
			},
			{
				id: "audit",
				label: "Nhật Ký Hoạt Động",
				icon: History,
				desc: "Lịch sử biến động dữ liệu",
			},
			{
				id: "settings",
				label: "Cài Đặt Hệ Thống",
				icon: SettingsIcon,
				desc: "Tài khoản & sao lưu",
			},
		);
	} else {
		// user?.role === 'user' (Cán bộ thôn)
		visibleItems = [
			{
				id: "analytics",
				label: "Thống Kê",
				icon: BarChart3,
				desc: `Báo cáo số liệu ${selectedVillageName || "thôn"}`,
				badge: "Chính",
			},
			{
				id: "chuctho",
				label: "Hồ Sơ Chúc Thọ",
				icon: Award,
				desc: "Chính sách chúc thọ người cao tuổi",
			},
			{
				id: "htxh",
				label: "Hưu Trí Xã Hội",
				icon: Users,
				desc: "Trợ cấp hưu trí xã hội các diện",
			},
			{
				id: "recycle-bin",
				label: "Thùng Rác",
				icon: Trash2,
				desc: "Hồ sơ đã xóa tạm",
			},
		];
	}

	return (
		<>
			{!isSidebarCollapsed && (
					<div
						className="fixed inset-0 bg-[rgba(15,23,42,0.45)] dark:bg-[rgba(0,0,0,0.6)] z-30 md:hidden animate-in fade-in duration-200"
						onClick={toggleSidebar}
					/>
			)}
			<aside
				className={`bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none transition-all duration-200 ease-out overflow-hidden ${
					isSidebarCollapsed
						? "w-14 sm:w-16"
						: "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:shadow-2xl w-64"
				}`}
			>
				{/* Top Brand / Category Title */}
				<div className="p-3 flex items-center justify-between border-b border-slate-900 min-h-[56px] overflow-hidden">
					{!isSidebarCollapsed ? (
						<>
							<div className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 items-center gap-2 whitespace-nowrap overflow-hidden hidden md:flex">
								<Database
									className="w-4 h-4 text-emerald-400 shrink-0"
									strokeWidth={1.5}
								/>
								<span>DANH MỤC</span>
							</div>
							<button
								type="button"
								onClick={toggleSidebar}
								aria-label="Thu gọn thanh điều hướng"
								title="Thu gọn thanh điều hướng"
								className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition-all cursor-pointer shrink-0 hidden md:block"
							>
								<PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
							</button>
							<button
								type="button"
								onClick={toggleSidebar}
								aria-label="Mở rộng thanh điều hướng"
								title="Mở rộng thanh điều hướng"
								className="w-full flex md:hidden items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
							>
								<PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={toggleSidebar}
							aria-label="Mở rộng thanh điều hướng"
							title="Mở rộng thanh điều hướng"
							className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
						>
							<PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
						</button>
					)}
				</div>

				{/* Nav items list */}
				<div className="p-2.5 flex-1 overflow-y-auto overflow-x-hidden">
					<nav className="flex flex-col gap-1.5">
						{visibleItems.map((item) => {
							const Icon = item.icon as React.ComponentType<{
								className?: string;
								strokeWidth?: number;
							}>;
							const isActive = activeTab === item.id;

							return (
								<div
									key={item.id}
									className="relative group flex justify-center w-full"
								>
									<button
										type="button"
										onClick={() => {
											if (item.id === "villages") {
												setSelectedVillageId("");
												setActiveTab("villages");
											} else {
												setActiveTab(item.id);
											}
											if (typeof window !== "undefined" && window.innerWidth < 768) {
												setSidebarCollapsed(true);
											}
										}}
									className={`flex items-center gap-3 rounded-2xl transition-all duration-150 relative cursor-pointer overflow-hidden ${
										isSidebarCollapsed
											? "w-12 h-12 justify-center shrink-0 mx-auto"
											: "w-12 h-12 md:w-full justify-center md:justify-start md:py-2.5 md:px-3 min-h-[44px]"
									} ${
										isActive
											? "bg-emerald-600 text-white shadow-md shadow-emerald-950/30"
											: "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50"
									}`}
								>
									<Icon
										className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : ""}`}
										strokeWidth={1.5}
									/>

									<div
										className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-out text-left ${
											isSidebarCollapsed
												? "max-w-0 opacity-0 pointer-events-none hidden"
												: "hidden md:flex max-w-[180px] opacity-100 flex-1 items-center justify-between"
										}`}
									>
										<span className="text-[13.5px] tracking-tight font-bold">
											{item.label}
										</span>
										{item.badge && (
											<span
												className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1.5 shrink-0 ${
													isActive
														? "bg-emerald-800/90 text-emerald-100"
													: "bg-slate-800 text-slate-300"
												}`}
											>
												{item.badge}
											</span>
										)}
									</div>
								</button>

								{/* Collapsed Tooltip Card */}
								{isSidebarCollapsed && (
									<div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700/90 whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
										<div className="flex items-center gap-1.5">
											<span className="text-sm">{item.label}</span>
											{item.badge && (
												<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-800 text-emerald-100 uppercase">
													{item.badge}
												</span>
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</nav>
			</div>

			{/* Bottom Footer */}
			<div className="p-3.5 border-t border-slate-900 bg-slate-950 text-xs text-slate-400 overflow-hidden">
				{!isSidebarCollapsed ? (
					<>
						<div className="space-y-1 whitespace-nowrap overflow-hidden hidden md:block">
							<div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
								<ShieldCheck
									className="w-4 h-4 text-emerald-400 shrink-0"
									strokeWidth={1.5}
								/>
								<span>QLCS v3.0.0</span>
							</div>
						</div>
						<div className="flex md:hidden justify-center">
							<ShieldCheck
								className="w-4 h-4 text-emerald-400"
								strokeWidth={1.5}
							/>
						</div>
					</>
				) : (
					<div className="flex justify-center">
						<ShieldCheck
							className="w-4 h-4 text-emerald-400"
							strokeWidth={1.5}
						/>
					</div>
				)}
			</div>
		</aside>
	</>
);
};

export default Sidebar;
