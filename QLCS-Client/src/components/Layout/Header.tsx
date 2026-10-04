import {
	Activity,
	FileText,
	LogOut,
	MapPin,
	Moon,
	Shield,
	Sun,
	User as UserIcon,
	Wifi,
	WifiOff,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useApp } from "../../AppContext";
import { ServerStatusModal } from "../network/ServerStatusModal";

export const Header: React.FC = () => {
	const {
		user,
		logout,
		isOnline,
		isBackendHealthy,
		latency,
		selectedVillageName,
		setActiveTab,
		setSelectedVillageId,
		theme,
		toggleTheme,
		zoomLevel,
		zoomIn,
		zoomOut,
		resetZoom,
	} = useApp();

	const [showStatusModal, setShowStatusModal] = useState(false);

	return (
		<>
			<header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none transition-colors duration-150">
				{/* Left: Brand */}
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
						<FileText className="w-5 h-5" strokeWidth={1.5} />
					</div>
					<div className="min-w-0">
						<div className="flex items-center gap-2 min-w-0">
							<h1 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
								QUẢN LÝ CHÍNH SÁCH
							</h1>
							<span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800 uppercase tracking-wider hidden sm:inline-block shrink-0">
								XÃ ĐĂK HÀ
							</span>
						</div>
						<p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
							Chúc Thọ & Hưu Trí Xã Hội Xã Đăk Hà
						</p>
					</div>
				</div>

				{/* Right Controls */}
				<div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
					{/* Zoom Controls Pill (Hidden on mobile) */}
					<div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-slate-300 text-xs">
						<button
							type="button"
							onClick={zoomOut}
							disabled={zoomLevel <= 80}
							aria-label="Thu nhỏ giao diện (Ctrl -)"
							title="Thu nhỏ giao diện (Ctrl -)"
							className="p-1.5 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
						>
							<ZoomOut className="w-3.5 h-3.5" strokeWidth={1.5} />
						</button>

						<button
							type="button"
							onClick={resetZoom}
							aria-label="Đặt lại kích thước 100% (Ctrl 0)"
							title="Bấm để đặt lại kích thước 100% (Ctrl 0)"
							className="px-2 py-1 font-mono tabular-nums font-bold text-[11px] hover:text-emerald-400 transition-colors cursor-pointer"
						>
							{zoomLevel}%
						</button>

						<button
							type="button"
							onClick={zoomIn}
							disabled={zoomLevel >= 140}
							aria-label="Phóng to giao diện (Ctrl +)"
							title="Phóng to giao diện (Ctrl +)"
							className="p-1.5 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
						>
							<ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
						</button>
					</div>

					{/* Dark / Light Theme Toggle */}
					<button
						type="button"
						onClick={toggleTheme}
						aria-label={
							theme === "dark"
								? "Chuyển sang giao diện Sáng"
								: "Chuyển sang giao diện Tối"
						}
						title={
							theme === "dark"
								? "Chuyển sang giao diện Sáng"
								: "Chuyển sang giao diện Tối"
						}
						className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-all active:scale-95 border border-slate-700 cursor-pointer"
					>
						{theme === "dark" ? (
							<Sun className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
						) : (
							<Moon className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
						)}
					</button>

					{/* Village Indicator */}
					{user?.role === "admin" ? (
						<button
							type="button"
							onClick={() => {
								setSelectedVillageId("");
								setActiveTab("villages");
							}}
							aria-label="Quay về Quản lý thôn (Toàn xã)"
							title="Quay về Quản lý thôn (Toàn xã)"
							className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-emerald-300 rounded-xl text-slate-200 text-xs font-bold border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer active:scale-95"
						>
							<MapPin
								className="w-3.5 h-3.5 text-emerald-400 shrink-0"
								strokeWidth={1.5}
							/>
							<span className="max-w-[140px] truncate">
								{selectedVillageName || "Toàn xã Đăk Hà"}
							</span>
						</button>
					) : (
						<div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-slate-200 text-xs font-bold border border-slate-700">
							<MapPin
								className="w-3.5 h-3.5 text-emerald-400 shrink-0"
								strokeWidth={1.5}
							/>
							<span className="max-w-[140px] truncate">
								{selectedVillageName || "Chưa chọn thôn"}
							</span>
						</div>
					)}

					{/* Network / Latency Pill */}
					<button
						type="button"
						onClick={() => setShowStatusModal(true)}
						aria-label="Xem chẩn đoán kết nối máy chủ"
						title="Bấm để xem chẩn đoán kết nối máy chủ"
						className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
							isOnline && isBackendHealthy
								? "bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60"
								: !isOnline
									? "bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60"
									: "bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60"
						}`}
					>
						{isOnline && isBackendHealthy ? (
							<>
								<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
								<Wifi
									className="w-3.5 h-3.5 text-emerald-400"
									strokeWidth={1.5}
								/>
								<span className="font-mono tabular-nums text-[11px]">
									{latency !== null ? `${latency}ms` : "Online"}
								</span>
							</>
						) : !isOnline ? (
							<>
								<WifiOff
									className="w-3.5 h-3.5 text-rose-400"
									strokeWidth={1.5}
								/>
								<span className="hidden sm:inline">Ngoại tuyến</span>
							</>
						) : (
							<>
								<Activity
									className="w-3.5 h-3.5 text-amber-400 animate-spin"
									strokeWidth={1.5}
								/>
								<span className="hidden sm:inline">Thử lại...</span>
							</>
						)}
					</button>

					<div className="h-5 w-px bg-slate-700" />

					{/* User Info & Role Badge */}
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
								{user?.username ? (
									user.username.slice(0, 2).toUpperCase()
								) : (
									<UserIcon className="w-4 h-4" strokeWidth={1.5} />
								)}
							</div>
							<div className="text-left hidden lg:block">
								<div className="text-xs font-black text-slate-200 leading-snug">
									{user?.username || "Cán bộ"}
								</div>
								<div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
									<Shield
										className="w-3 h-3 text-emerald-400"
										strokeWidth={1.5}
									/>
									<span>
										{user?.role === "admin"
											? "Cán bộ Xã (Admin)"
											: "Trưởng Thôn"}
									</span>
								</div>
							</div>
						</div>

						{/* Logout Button */}
						<button
							type="button"
							onClick={logout}
							aria-label="Đăng xuất khỏi hệ thống"
							title="Đăng xuất khỏi hệ thống"
							className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition-all active:scale-95 cursor-pointer"
						>
							<LogOut className="w-4 h-4" strokeWidth={1.5} />
						</button>
					</div>
				</div>
			</header>

			<ServerStatusModal
				isOpen={showStatusModal}
				onClose={() => setShowStatusModal(false)}
				latency={latency}
				isBackendHealthy={isBackendHealthy}
			/>
		</>
	);
};

export default Header;
