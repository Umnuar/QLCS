import clsx from "clsx";
import {
	AlertCircle,
	Eye,
	EyeOff,
	Lock,
	ShieldCheck,
	User as UserIcon,
	Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAppContext } from "../AppContext";
import { authApi } from "../api/auth";
import { secureStorage } from "../utils/secureStorage";

export default function Login() {
	const { setUser, setActiveTab, setSelectedVillageId, isDarkMode } =
		useAppContext();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isLoading) return;
		if (!username.trim() || !password.trim()) {
			setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
			return;
		}

		setError(null);
		setIsLoading(true);

		try {
			const data = await authApi.login(username.trim().toLowerCase(), password);
			if (!data?.accessToken || !data?.user) {
				throw new Error("Phản hồi đăng nhập không hợp lệ.");
			}
			await secureStorage.setItem("accessToken", data.accessToken);
			if (data.refreshToken) {
				await secureStorage.setItem("refreshToken", data.refreshToken);
			}
			await secureStorage.setItem("user", JSON.stringify(data.user));
			setUser(data.user);
			if (data.user.role === "admin") {
				setSelectedVillageId("");
				setActiveTab("villages");
			} else if (data.user.role === "user") {
				setSelectedVillageId(data.user.village_id || "");
				setActiveTab("analytics");
			}
		} catch (err: any) {
			console.error(err);
			const serverMsg =
				err.response?.data?.error ||
				err.message ||
				"Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc kết nối mạng.";
			setError(serverMsg);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={clsx(
				"min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 font-sans select-none",
				"bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100",
				isDarkMode ? "dark" : "",
			)}
		>
			<div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 shadow-2xl border-t-4 border-t-emerald-600">
				{/* Header Branding */}
				<div className="text-center mb-8">
					<div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 border-[3px] border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full mx-auto flex items-center justify-center mb-5 shadow-xs">
						<Users className="w-10 h-10" strokeWidth={1.5} />
					</div>
					<h1 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight mb-1">
						Đăng nhập
					</h1>
					<p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">
						QUẢN LÝ CHÍNH SÁCH XÃ HỘI & NGƯỜI CAO TUỔI — XÃ ĐĂK HÀ
					</p>
				</div>

				{/* Error Alert */}
				{error && (
					<div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
						<AlertCircle
							className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400"
							strokeWidth={1.5}
						/>
						<span>{error}</span>
					</div>
				)}

				{/* Login Form */}
				<form onSubmit={handleLogin} className="space-y-5">
					<div>
						<label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
							Tên đăng nhập
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<UserIcon className="w-5 h-5" strokeWidth={1.5} />
							</div>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Nhập tài khoản (admin, thon1...)"
								required
								autoFocus
								autoComplete="username"
								className="w-full h-12 pl-11 pr-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-medium"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
							Mật khẩu
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<Lock className="w-5 h-5" strokeWidth={1.5} />
							</div>
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Nhập mật khẩu"
								required
								autoComplete="current-password"
								className="w-full h-12 pl-11 pr-12 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-medium"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
								tabIndex={-1}
								aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
							>
								{showPassword ? (
									<EyeOff className="w-5 h-5" strokeWidth={1.5} />
								) : (
									<Eye className="w-5 h-5" strokeWidth={1.5} />
								)}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full mt-2 h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider text-[13px]"
					>
						{isLoading ? (
							<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<span>ĐĂNG NHẬP</span>
						)}
					</button>
				</form>

				{/* Security Footer */}
				<div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
					<p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
						<ShieldCheck
							className="w-4 h-4 text-emerald-500"
							strokeWidth={1.5}
						/>
						<span>
							Bảo mật dữ liệu Chính sách xã hội & Người cao tuổi Xã Đăk Hà
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
