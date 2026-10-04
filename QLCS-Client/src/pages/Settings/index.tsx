import {
	Building2,
	CheckCircle2,
	Database,
	Edit3,
	Eye,
	EyeOff,
	Home,
	Info,
	KeyRound,
	LogOut,
	MapPin,
	Plus,
	RefreshCw,
	Shield,
	Trash2,
	User as UserIcon,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../AppContext";
import { authApi } from "../../api/auth";
import { settingsApi } from "../../api/settings";
import { type UserItem, usersApi } from "../../api/usersApi";
import { CustomSelect } from "../../components/common/CustomSelect";
import { BackupRestoreTab } from "../../components/settings/BackupRestoreTab";
import { useModal } from "../../hooks/useModal";
import { TimeCard } from "./TimeCard";

type SettingsTab = "profile" | "users" | "backup" | "system";

const COMMUNE_INFO_KEY = "qlcs_commune_info";

interface CommuneInfo {
	communeName: string;
	districtName: string;
	provinceName: string;
	communePhone: string;
	communeAddress: string;
	communeEmail: string;
}

const DEFAULT_COMMUNE_INFO: CommuneInfo = {
	communeName: "Ủy ban nhân dân Xã Đăk Hà",
	districtName: "Huyện Đăk Hà",
	provinceName: "Tỉnh Kon Tum",
	communePhone: "0260.3822.123",
	communeAddress: "Trung tâm Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum",
	communeEmail: "ubnd.xadakha@kontum.gov.vn",
};

export const Settings: React.FC = () => {
	const { villages, user, logout } = useAppContext();
	const { showAlert, showConfirm } = useModal();
	const isAdmin = user?.role === "admin";

	const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

	// --- TAB 1: PROFILE & ĐỔI MẬT KHẨU CÁ NHÂN ---
	const [currentPasswordOwn, setCurrentPasswordOwn] = useState("");
	const [newPasswordOwn, setNewPasswordOwn] = useState("");
	const [confirmPasswordOwn, setConfirmPasswordOwn] = useState("");
	const [showPasswordOwn, setShowPasswordOwn] = useState(false);
	const [loadingOwnPassword, setLoadingOwnPassword] = useState(false);

	// --- TAB 2: QUẢN LÝ CÁN BỘ THÔN (ADMIN) ---
	const [usersList, setUsersList] = useState<UserItem[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(false);

	// Form thêm cán bộ
	const [isAddUserOpen, setIsAddUserOpen] = useState(false);
	const [newUsername, setNewUsername] = useState("");
	const [newUserPassword, setNewUserPassword] = useState("");
	const [newUserVillageId, setNewUserVillageId] = useState("");
	const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");

	// Modal đặt lại mật khẩu cán bộ
	const [resetPwdUser, setResetPwdUser] = useState<UserItem | null>(null);
	const [resetPwdValue, setResetPwdValue] = useState("");
	const [showResetPwd, setShowResetPwd] = useState(false);
	const [loadingResetPwd, setLoadingResetPwd] = useState(false);

	// Modal phân công thôn cán bộ
	const [assignUser, setAssignUser] = useState<UserItem | null>(null);
	const [assignVillageId, setAssignVillageId] = useState("");
	const [assignRole, setAssignRole] = useState<"admin" | "user">("user");
	const [loadingAssign, setLoadingAssign] = useState(false);

	// --- TAB 4: THÔNG TIN ĐƠN VỊ & HỆ THỐNG ---
	const [communeInfo, setCommuneInfo] = useState<CommuneInfo>(() => {
		try {
			const saved = localStorage.getItem(COMMUNE_INFO_KEY);
			if (saved) return JSON.parse(saved);
		} catch {
			// ignore
		}
		return DEFAULT_COMMUNE_INFO;
	});
	const [loadingSaveCommune, setLoadingSaveCommune] = useState(false);
	const [savedCommune, setSavedCommune] = useState(false);

	const fetchUsers = useCallback(async () => {
		setLoadingUsers(true);
		try {
			const list = await usersApi.getUsers();
			setUsersList(Array.isArray(list) ? list : []);
		} catch (error) {
			console.error("Error fetching users", error);
		} finally {
			setLoadingUsers(false);
		}
	}, []);

	// Load commune info from backend settings on mount
	useEffect(() => {
		settingsApi
			.getSettings()
			.then((settings) => {
				if (settings) {
					setCommuneInfo((prev) => ({
						communeName: settings.communeName || prev.communeName,
						districtName: settings.districtName || prev.districtName,
						provinceName: settings.provinceName || prev.provinceName,
						communePhone: settings.communePhone || prev.communePhone,
						communeAddress: settings.communeAddress || prev.communeAddress,
						communeEmail: settings.communeEmail || prev.communeEmail,
					}));
				}
			})
			.catch((e) => {
				console.warn("Failed to load commune settings from backend:", e);
			});
	}, []);

	useEffect(() => {
		if (activeTab === "users" && isAdmin) {
			fetchUsers();
		}
	}, [activeTab, isAdmin, fetchUsers]);

	// Đổi mật khẩu cá nhân
	const handleChangeOwnPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentPasswordOwn.trim()) {
			showAlert(
				"Thiếu thông tin",
				"Vui lòng nhập mật khẩu hiện tại.",
				"warning",
			);
			return;
		}
		if (newPasswordOwn.length < 6) {
			showAlert(
				"Mật khẩu yếu",
				"Mật khẩu mới phải có ít nhất 6 ký tự.",
				"warning",
			);
			return;
		}
		if (newPasswordOwn !== confirmPasswordOwn) {
			showAlert("Không khớp", "Mật khẩu xác nhận không trùng khớp.", "warning");
			return;
		}

		setLoadingOwnPassword(true);
		try {
			await authApi.changePassword(currentPasswordOwn, newPasswordOwn);
			setCurrentPasswordOwn("");
			setNewPasswordOwn("");
			setConfirmPasswordOwn("");
			showAlert("Thành công", "Đổi mật khẩu cá nhân thành công!", "success");
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Không thể đổi mật khẩu cá nhân. Vui lòng thử lại.";
			showAlert("Lỗi", msg, "error");
		} finally {
			setLoadingOwnPassword(false);
		}
	};

	// Tạo tài khoản cán bộ mới
	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newUsername.trim() || !newUserPassword.trim()) {
			showAlert(
				"Thiếu thông tin",
				"Vui lòng nhập tên đăng nhập và mật khẩu.",
				"warning",
			);
			return;
		}
		if (newUserPassword.trim().length < 6) {
			showAlert("Mật khẩu yếu", "Mật khẩu phải có ít nhất 6 ký tự.", "warning");
			return;
		}
		try {
			await usersApi.createUser({
				username: newUsername.trim(),
				password: newUserPassword.trim(),
				role: newUserRole,
				village_id: newUserRole === "user" ? newUserVillageId || null : null,
			});
			setIsAddUserOpen(false);
			setNewUsername("");
			setNewUserPassword("");
			setNewUserVillageId("");
			setNewUserRole("user");
			fetchUsers();
			showAlert("Thành công", "Tạo tài khoản cán bộ thành công.", "success");
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Không thể tạo tài khoản";
			showAlert("Lỗi", msg, "error");
		}
	};

	// Đặt lại mật khẩu cán bộ
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!resetPwdUser) return;
		if (!resetPwdValue.trim() || resetPwdValue.trim().length < 6) {
			showAlert(
				"Mật khẩu yếu",
				"Mật khẩu mới phải có ít nhất 6 ký tự.",
				"warning",
			);
			return;
		}
		setLoadingResetPwd(true);
		try {
			await usersApi.resetPassword(resetPwdUser.id, resetPwdValue.trim());
			setResetPwdUser(null);
			setResetPwdValue("");
			showAlert(
				"Thành công",
				`Đã đặt lại mật khẩu cho cán bộ "${resetPwdUser.username}" thành công.`,
				"success",
			);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Không thể đặt lại mật khẩu";
			showAlert("Lỗi", msg, "error");
		} finally {
			setLoadingResetPwd(false);
		}
	};

	// Phân công thôn cán bộ
	const handleAssignVillage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!assignUser) return;
		setLoadingAssign(true);
		try {
			await usersApi.updateUser(assignUser.id, {
				role: assignRole,
				village_id: assignRole === "user" ? assignVillageId || null : null,
			});
			setAssignUser(null);
			fetchUsers();
			showAlert(
				"Thành công",
				"Cập nhật phân công cán bộ thành công.",
				"success",
			);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Không thể cập nhật phân công";
			showAlert("Lỗi", msg, "error");
		} finally {
			setLoadingAssign(false);
		}
	};

	// Xóa tài khoản cán bộ
	const handleDeleteUser = async (u: UserItem) => {
		if (u.username === "admin") {
			showAlert(
				"Không thể xóa",
				"Tài khoản Quản trị viên tối cao (admin) không được phép xóa.",
				"warning",
			);
			return;
		}

		if (u.id === user?.id || u.username === user?.username) {
			showAlert(
				"Không thể xóa",
				"Không thể tự xóa tài khoản đang đăng nhập hiện tại.",
				"warning",
			);
			return;
		}

		const confirmed = await showConfirm(
			"Xác nhận xóa tài khoản",
			`Bạn có chắc muốn xóa tài khoản cán bộ "${u.username}" không?\nThao tác này không thể hoàn tác.`,
			"error",
		);

		if (!confirmed) return;

		try {
			await usersApi.deleteUser(u.id);
			fetchUsers();
			showAlert(
				"Thành công",
				`Đã xóa tài khoản cán bộ "${u.username}" thành công.`,
				"success",
			);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Không thể xóa tài khoản";
			showAlert("Lỗi", msg, "error");
		}
	};

	// Lưu thông tin đơn vị hành chính
	const handleSaveCommune = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoadingSaveCommune(true);
		try {
			localStorage.setItem(COMMUNE_INFO_KEY, JSON.stringify(communeInfo));
			await settingsApi.updateSettings({
				communeName: communeInfo.communeName,
				districtName: communeInfo.districtName,
				provinceName: communeInfo.provinceName,
				communePhone: communeInfo.communePhone,
				communeAddress: communeInfo.communeAddress,
				communeEmail: communeInfo.communeEmail,
			});
			setSavedCommune(true);
			setTimeout(() => setSavedCommune(false), 3000);
			showAlert(
				"Đã lưu thông tin",
				"Thông tin Đơn vị Hành chính đã được cập nhật đồng bộ lên toàn hệ thống.",
				"success",
			);
		} catch (err: unknown) {
			console.error(err);
			showAlert("Thông báo", "Đã lưu cấu hình cục bộ trên máy trạm.", "info");
		} finally {
			setLoadingSaveCommune(false);
		}
	};

	const currentVillageName =
		user?.role === "admin"
			? "Toàn xã Đăk Hà"
			: villages.find((v) => v.id === user?.village_id)?.name ||
				"Chưa phân công";

	const userInitials = (user?.username || "CB").slice(0, 2).toUpperCase();

	return (
		<div className="space-y-6 max-w-5xl mx-auto pb-12 select-none animate-in fade-in">
			{/* 5 TABS ĐIỀU HƯỚNG CHUẨN QLHK & QLNN */}
			<div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
				<button
					type="button"
					onClick={() => setActiveTab("profile")}
					className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
						activeTab === "profile"
							? "bg-emerald-600 text-white shadow-xs"
							: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					}`}
				>
					<UserIcon className="w-4 h-4" strokeWidth={1.5} />
					<span>Tài Khoản Của Tôi</span>
				</button>

				{isAdmin && (
					<button
						type="button"
						onClick={() => setActiveTab("users")}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
							activeTab === "users"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
						}`}
					>
						<Users className="w-4 h-4" strokeWidth={1.5} />
						<span>Quản Lý Cán Bộ Thôn</span>
					</button>
				)}

				{isAdmin && (
					<button
						type="button"
						onClick={() => setActiveTab("backup")}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
							activeTab === "backup"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
						}`}
					>
						<Database className="w-4 h-4" strokeWidth={1.5} />
						<span>Sao Lưu CSDL</span>
					</button>
				)}

				<button
					type="button"
					onClick={() => setActiveTab("system")}
					className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
						activeTab === "system"
							? "bg-emerald-600 text-white shadow-xs"
							: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					}`}
				>
					<Building2 className="w-4 h-4" strokeWidth={1.5} />
					<span>Thông Tin Đơn Vị & Hệ Thống</span>
				</button>
			</div>

			{/* TAB 1: TÀI KHOẢN CỦA TÔI */}
			{activeTab === "profile" && (
				<div className="space-y-6 animate-in fade-in">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Card 1: Thông tin tài khoản */}
						<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
							<div>
								<div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
									<div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0 shadow-inner">
										{userInitials}
									</div>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
												{user?.username}
											</h3>
											<span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
												<span>Hoạt động</span>
											</span>
										</div>
										<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
											{user?.role === "admin"
												? "Quản trị viên Xã (Admin)"
												: "Cán bộ phụ trách Thôn"}
										</p>
									</div>
								</div>

								<div className="mt-5 space-y-3.5 text-xs">
									<div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
										<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
											<Shield className="w-3.5 h-3.5 text-slate-400" />
											<span>Vai trò hệ thống:</span>
										</span>
										<span className="font-bold text-slate-900 dark:text-white">
											{user?.role === "admin"
												? "Cán bộ Quản trị Xã"
												: "Cán bộ Cơ sở"}
										</span>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
										<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
											<Home className="w-3.5 h-3.5 text-slate-400" />
											<span>Đơn vị công tác:</span>
										</span>
										<span className="font-bold text-slate-900 dark:text-white">
											{communeInfo.communeName || "UBND Xã Đăk Hà"}
										</span>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
										<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
											<MapPin className="w-3.5 h-3.5 text-slate-400" />
											<span>Địa bàn quản lý:</span>
										</span>
										<span className="font-bold text-emerald-600 dark:text-emerald-400">
											{currentVillageName}
										</span>
									</div>
								</div>
							</div>

							<div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
								<button
									type="button"
									onClick={() => logout()}
									className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
								>
									<LogOut className="w-4 h-4" strokeWidth={1.5} />
									<span>Đăng Xuất Khỏi Hệ Thống</span>
								</button>
							</div>
						</div>

						{/* Card 2: Đổi mật khẩu cá nhân */}
						<form
							onSubmit={handleChangeOwnPassword}
							className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5"
						>
							<div>
								<div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
									<div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
										<KeyRound className="w-5 h-5" strokeWidth={1.5} />
									</div>
									<div>
										<h3 className="font-bold text-base text-slate-900 dark:text-white">
											Đổi Mật Khẩu Cá Nhân
										</h3>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											Cập nhật mật khẩu bảo vệ tài khoản của bạn
										</p>
									</div>
								</div>

								<div className="mt-4 space-y-4">
									<div>
										<label
											htmlFor="current-password-own-input"
											className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
										>
											Mật Khẩu Hiện Tại *
										</label>
										<input
											id="current-password-own-input"
											type={showPasswordOwn ? "text" : "password"}
											required
											value={currentPasswordOwn}
											onChange={(e) => setCurrentPasswordOwn(e.target.value)}
											placeholder="Nhập mật khẩu đang dùng"
											className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
										/>
									</div>
									<div>
										<label
											htmlFor="new-password-own-input"
											className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
										>
											Mật Khẩu Mới *
										</label>
										<div className="relative">
											<input
												id="new-password-own-input"
												type={showPasswordOwn ? "text" : "password"}
												required
												value={newPasswordOwn}
												onChange={(e) => setNewPasswordOwn(e.target.value)}
												placeholder="Ít nhất 6 ký tự"
												className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
											/>
											<button
												type="button"
												onClick={() => setShowPasswordOwn(!showPasswordOwn)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
												aria-label={
													showPasswordOwn ? "Ẩn mật khẩu" : "Hiện mật khẩu"
												}
											>
												{showPasswordOwn ? (
													<EyeOff className="w-4 h-4" strokeWidth={1.5} />
												) : (
													<Eye className="w-4 h-4" strokeWidth={1.5} />
												)}
											</button>
										</div>
									</div>

									<div>
										<label
											htmlFor="confirm-password-own-input"
											className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
										>
											Xác Nhận Mật Khẩu Mới *
										</label>
										<input
											id="confirm-password-own-input"
											type={showPasswordOwn ? "text" : "password"}
											required
											value={confirmPasswordOwn}
											onChange={(e) => setConfirmPasswordOwn(e.target.value)}
											placeholder="Nhập lại mật khẩu mới"
											className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
										/>
									</div>
								</div>
							</div>

							<div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
								<button
									type="submit"
									disabled={loadingOwnPassword || !newPasswordOwn}
									className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
								>
									<KeyRound className="w-4 h-4" strokeWidth={1.5} />
									<span>
										{loadingOwnPassword
											? "Đang cập nhật..."
											: "Cập Nhật Mật Khẩu"}
									</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* TAB 2: QUẢN LÝ CÁN BỘ THÔN (ADMIN) */}
			{activeTab === "users" && isAdmin && (
				<div className="space-y-6 animate-in fade-in">
					<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
								<Users className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
								<span>Danh Sách Tài Khoản Cán Bộ ({usersList.length})</span>
							</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
								Quản trị tài khoản đăng nhập, phân công địa bàn quản lý thôn và
								đặt lại mật khẩu cán bộ
							</p>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={fetchUsers}
								className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer transition-colors"
								title="Làm mới danh sách"
								aria-label="Làm mới danh sách"
							>
								<RefreshCw
									className={`w-4 h-4 ${loadingUsers ? "animate-spin text-emerald-600" : ""}`}
									strokeWidth={1.5}
								/>
							</button>
							<button
								type="button"
								onClick={() => setIsAddUserOpen(true)}
								className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
							>
								<Plus className="w-4 h-4" strokeWidth={1.5} />
								<span>Thêm Cán Bộ</span>
							</button>
						</div>
					</div>

					{/* Form thêm cán bộ mới */}
					{isAddUserOpen && (
						<form
							onSubmit={handleCreateUser}
							className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in"
						>
							<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
								<h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
									<Plus
										className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
										strokeWidth={1.5}
									/>
									<span>Thêm Tài Khoản Cán Bộ Mới</span>
								</h4>
								<button
									type="button"
									onClick={() => setIsAddUserOpen(false)}
									className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
									aria-label="Đóng form"
								>
									<X className="w-4 h-4" strokeWidth={1.5} />
								</button>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="new-user-username-input"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
									>
										Tên Đăng Nhập *
									</label>
									<input
										id="new-user-username-input"
										type="text"
										required
										value={newUsername}
										onChange={(e) => setNewUsername(e.target.value)}
										placeholder="canbothon1"
										className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
									/>
								</div>
								<div>
									<label
										htmlFor="new-user-password-input"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
									>
										Mật Khẩu Khởi Tạo *
									</label>
									<input
										id="new-user-password-input"
										type="password"
										required
										value={newUserPassword}
										onChange={(e) => setNewUserPassword(e.target.value)}
										placeholder="Ít nhất 6 ký tự"
										className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
									/>
								</div>
								<div>
									<CustomSelect
										label="Vai trò"
										value={newUserRole}
										onChange={(val) => setNewUserRole(val as "admin" | "user")}
										options={[
											{ value: "user", label: "Cán bộ Thôn (User)" },
											{ value: "admin", label: "Quản trị viên Xã (Admin)" },
										]}
									/>
								</div>
								{newUserRole === "user" && (
									<div>
										<CustomSelect
											label="Phân công Thôn"
											value={newUserVillageId}
											onChange={(val) => setNewUserVillageId(String(val))}
											options={villages.map((v) => ({
												value: v.id,
												label: v.name,
											}))}
											placeholder="Chọn thôn phụ trách"
										/>
									</div>
								)}
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<button
									type="button"
									onClick={() => setIsAddUserOpen(false)}
									className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
								>
									Hủy
								</button>
								<button
									type="submit"
									className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
								>
									<Plus className="w-4 h-4" strokeWidth={1.5} />
									<span>Tạo Tài Khoản</span>
								</button>
							</div>
						</form>
					)}

					{/* Modal đặt lại mật khẩu cán bộ */}
					{resetPwdUser && (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(15,23,42,0.45)] dark:bg-[rgba(0,0,0,0.6)] animate-in fade-in">
							<form
								onSubmit={handleResetPassword}
								className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-w-md w-full animate-in fade-in"
							>
								<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
									<h4 className="text-sm font-bold text-slate-900 dark:text-white">
										Đặt lại mật khẩu cho:{" "}
										<strong className="text-emerald-600">
											{resetPwdUser.username}
										</strong>
									</h4>
									<button
										type="button"
										onClick={() => setResetPwdUser(null)}
										className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
										aria-label="Đóng modal"
									>
										<X className="w-4 h-4" strokeWidth={1.5} />
									</button>
								</div>
								<div>
									<label
										htmlFor="reset-user-password-input"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
									>
										Mật khẩu mới (ít nhất 6 ký tự)
									</label>
									<div className="relative">
										<input
											id="reset-user-password-input"
											type={showResetPwd ? "text" : "password"}
											required
											value={resetPwdValue}
											onChange={(e) => setResetPwdValue(e.target.value)}
											placeholder="Nhập mật khẩu mới..."
											className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
										/>
										<button
											type="button"
											onClick={() => setShowResetPwd(!showResetPwd)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
											aria-label={
												showResetPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"
											}
										>
											{showResetPwd ? (
												<EyeOff className="w-4 h-4" strokeWidth={1.5} />
											) : (
												<Eye className="w-4 h-4" strokeWidth={1.5} />
											)}
										</button>
									</div>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<button
										type="button"
										onClick={() => setResetPwdUser(null)}
										className="min-h-[44px] px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
									>
										Hủy
									</button>
									<button
										type="submit"
										disabled={loadingResetPwd}
										className="min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
									>
										{loadingResetPwd ? "Đang lưu..." : "Lưu mật khẩu"}
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Modal phân công thôn cán bộ */}
					{assignUser && (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(15,23,42,0.45)] dark:bg-[rgba(0,0,0,0.6)] animate-in fade-in">
							<form
								onSubmit={handleAssignVillage}
								className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-w-md w-full animate-in fade-in"
							>
								<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
									<h4 className="text-sm font-bold text-slate-900 dark:text-white">
										Phân công thôn cho:{" "}
										<strong className="text-emerald-600">
											{assignUser.username}
										</strong>
									</h4>
									<button
										type="button"
										onClick={() => setAssignUser(null)}
										className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
										aria-label="Đóng modal"
									>
										<X className="w-4 h-4" strokeWidth={1.5} />
									</button>
								</div>
								<div className="space-y-3">
									<div>
										<CustomSelect
											label="Vai trò"
											value={assignRole}
											onChange={(val) => setAssignRole(val as "admin" | "user")}
											options={[
												{ value: "user", label: "Cán bộ Thôn (User)" },
												{ value: "admin", label: "Quản trị viên Xã (Admin)" },
											]}
										/>
									</div>
									{assignRole === "user" && (
										<div>
											<CustomSelect
												label="Thôn Phụ Trách"
												value={assignVillageId}
												onChange={(val) => setAssignVillageId(String(val))}
												options={villages.map((v) => ({
													value: v.id,
													label: v.name,
												}))}
												placeholder="Chọn thôn"
											/>
										</div>
									)}
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<button
										type="button"
										onClick={() => setAssignUser(null)}
										className="min-h-[44px] px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
									>
										Hủy
									</button>
									<button
										type="submit"
										disabled={loadingAssign}
										className="min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
									>
										{loadingAssign ? "Đang lưu..." : "Lưu phân công"}
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Bảng danh sách cán bộ */}
					<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left border-separate border-spacing-0 whitespace-nowrap">
								<thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
									<tr>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Tài Khoản
										</th>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Vai Trò
										</th>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Địa Bàn Phụ Trách
										</th>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Trạng Thái
										</th>
										<th className="px-4 py-3 text-right border-b border-slate-200 dark:border-slate-800">
											Hành Động
										</th>
									</tr>
								</thead>
								<tbody className="font-medium">
									{usersList.map((u) => {
										const villageName =
											villages.find((v) => v.id === u.village_id)?.name ||
											(u.role === "admin"
												? "Toàn xã Đăk Hà"
												: "Chưa phân công");
										const isOnline = true;
										return (
											<tr
												key={u.id}
												className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
											>
												<td className="px-4 py-3 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
													<div className="flex items-center gap-2">
														<div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700">
															{u.username.slice(0, 2).toUpperCase()}
														</div>
														<span>{u.username}</span>
													</div>
												</td>
												<td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
													<span
														className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
															u.role === "admin"
																? "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
																: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
														}`}
													>
														{u.role === "admin" ? "Admin Xã" : "Cán bộ thôn"}
													</span>
												</td>
												<td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800">
													{villageName}
												</td>
												<td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
													<div className="flex items-center gap-1.5">
														<span
															className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
														/>
														<span className="text-[11px] text-slate-500 dark:text-slate-400">
															{isOnline ? "Hoạt động" : "Ngoại tuyến"}
														</span>
													</div>
												</td>
												<td className="px-4 py-3 text-right border-b border-slate-100 dark:border-slate-800">
													<div className="flex items-center justify-end gap-1.5">
														<button
															type="button"
															onClick={() => {
																setAssignUser(u);
																setAssignRole(
																	(u.role as "admin" | "user") || "user",
																);
																setAssignVillageId(u.village_id || "");
															}}
															className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
															title="Phân công thôn"
															aria-label={`Phân công thôn cho ${u.username}`}
														>
															<Edit3
																className="w-3.5 h-3.5"
																strokeWidth={1.5}
															/>
														</button>
														<button
															type="button"
															onClick={() => {
																setResetPwdUser(u);
																setResetPwdValue("");
															}}
															className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
															title="Đổi mật khẩu cán bộ"
															aria-label={`Đổi mật khẩu cho ${u.username}`}
														>
															<KeyRound
																className="w-3.5 h-3.5"
																strokeWidth={1.5}
															/>
														</button>
														<button
															type="button"
															onClick={() => handleDeleteUser(u)}
															disabled={
																u.id === user?.id || u.username === "admin"
															}
															className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
															title="Xóa tài khoản"
															aria-label={`Xóa tài khoản ${u.username}`}
														>
															<Trash2
																className="w-3.5 h-3.5"
																strokeWidth={1.5}
															/>
														</button>
													</div>
												</td>
											</tr>
										);
									})}
									{usersList.length === 0 && (
										<tr>
											<td
												colSpan={5}
												className="px-4 py-8 text-center text-slate-400"
											>
												Chưa có tài khoản cán bộ nào
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* TAB 3: SAO LƯU CSDL (ADMIN) */}
			{activeTab === "backup" && isAdmin && (
				<div className="space-y-6 animate-in fade-in">
					<BackupRestoreTab />
				</div>
			)}

			{/* TAB 4: THÔNG TIN ĐƠN VỊ & HỆ THỐNG */}
			{activeTab === "system" && (
				<div className="space-y-6 animate-in fade-in">
					<TimeCard />

					{/* Card 1: Thông Tin Đơn Vị Hành Chính */}
					<form
						onSubmit={handleSaveCommune}
						className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
					>
						<div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
									<Building2 className="w-5 h-5" strokeWidth={1.5} />
								</div>
								<div>
									<h3 className="font-black text-slate-900 dark:text-white text-base">
										Thông Tin Đơn Vị Hành Chính
									</h3>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
										Xuất hiện trên tiêu đề báo cáo, biểu mẫu Excel và thống kê
										chính thức
									</p>
								</div>
							</div>
							{savedCommune && (
								<span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
									<CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
									<span>Đã lưu thành công</span>
								</span>
							)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="commune-name-input"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Tên Đơn Vị Cấp Xã *
								</label>
								<input
									id="commune-name-input"
									type="text"
									required
									value={communeInfo.communeName}
									onChange={(e) =>
										setCommuneInfo({
											...communeInfo,
											communeName: e.target.value,
										})
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="district-name-input"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Huyện Quản Lý *
								</label>
								<input
									id="district-name-input"
									type="text"
									required
									value={communeInfo.districtName}
									onChange={(e) =>
										setCommuneInfo({
											...communeInfo,
											districtName: e.target.value,
										})
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="province-name-input"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Tỉnh / Thành Phố *
								</label>
								<input
									id="province-name-input"
									type="text"
									required
									value={communeInfo.provinceName}
									onChange={(e) =>
										setCommuneInfo({
											...communeInfo,
											provinceName: e.target.value,
										})
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-phone-input"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Điện Thoại Trực Ban
								</label>
								<input
									id="commune-phone-input"
									type="text"
									value={communeInfo.communePhone}
									onChange={(e) =>
										setCommuneInfo({
											...communeInfo,
											communePhone: e.target.value,
										})
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-address-input"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Trụ Sở Làm Việc
								</label>
								<input
									id="commune-address-input"
									type="text"
									value={communeInfo.communeAddress}
									onChange={(e) =>
										setCommuneInfo({
											...communeInfo,
											communeAddress: e.target.value,
										})
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-email-input"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Hòm Thư Điện Tử (Email)
								</label>
								<input
									id="commune-email-input"
									type="email"
									value={communeInfo.communeEmail}
									onChange={(e) =>
										setCommuneInfo({
											...communeInfo,
											communeEmail: e.target.value,
										})
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>
						</div>

						{isAdmin && (
							<div className="pt-3 flex justify-end">
								<button
									type="submit"
									disabled={loadingSaveCommune}
									className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
								>
									{loadingSaveCommune ? "Đang lưu..." : "Lưu Thay Đổi"}
								</button>
							</div>
						)}
					</form>

					{/* Card 2: Thông Tin Phần Mềm QLCS */}
					<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
						<div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
							<div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
								<Info className="w-5 h-5" strokeWidth={1.5} />
							</div>
							<div>
								<h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
									Thông Tin Phần Mềm QLCS Xã Đăk Hà
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Chuẩn hóa giao diện & kiến trúc vận hành theo quy chuẩn Doanh
									nghiệp QLCS
								</p>
							</div>
						</div>

						<div className="space-y-2.5 text-xs">
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Tên hệ thống:
								</span>
								<span className="font-bold text-slate-900 dark:text-white">
									Hệ Thống Quản Lý Dữ Liệu Chính Sách Xã Hội Xã Đăk Hà
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Mã phần mềm:
								</span>
								<span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
									QLCS-DAKHA
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Phiên bản phát hành:
								</span>
								<span className="font-mono font-bold text-slate-800 dark:text-slate-200">
									v3.0.0 (Production Stable Edition)
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Đơn vị triển khai:
								</span>
								<span className="font-bold text-slate-900 dark:text-white">
									{communeInfo.communeName || "Ủy Ban Nhân Dân Xã Đăk Hà, Tỉnh Kon Tum"}
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Công nghệ nền tảng:
								</span>
								<span className="font-mono text-slate-600 dark:text-slate-300">
									Vite 5 • React 18 • Tailwind CSS • PostgreSQL
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5">
								<span className="text-slate-500 dark:text-slate-400">
									Bản quyền & Vận hành:
								</span>
								<span className="font-medium text-slate-600 dark:text-slate-400">
									© 2026 UBND Xã Đăk Hà. Toàn quyền bảo lưu.
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Settings;
