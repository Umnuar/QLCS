import {
	ArrowLeft,
	Award,
	BarChart3,
	Calendar,
	CheckCircle,
	Clock,
	Download,
	PieChart,
	RefreshCw,
	RotateCcw,
	TrendingUp,
	Users,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../AppContext";
import {
	type AnalyticsByVillageResponse,
	type AnalyticsOverviewData,
	analyticsApi,
} from "../api/analyticsApi";
import { htxhApi } from "../api/htxh";
import { profilesApi } from "../api/profiles";
import {
	BarRow,
	ChartPanel,
	KpiCard,
	MiniDonut,
	STAT_ACCENTS,
	ScrollFadeContainer,
	formatVnPercent,
} from "../components/analytics/AnalyticsWidgets";
import {
	TABLE_STYLES,
	formatVietnameseNumber,
} from "../components/common/tableStyles";
import { YearSelector } from "./Dashboard/components/YearSelector";

export const AnalyticsPage: React.FC = () => {
	const {
		villages,
		selectedVillageId,
		setSelectedVillageId,
		setActiveTab,
		user,
	} = useApp();
	const isAdmin = user?.role === "admin";
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState<number>(() => {
		const saved = localStorage.getItem("globalCalculationYear");
		if (saved) {
			const parsed = parseInt(saved, 10);
			if (!isNaN(parsed) && parsed >= 1900 && parsed <= 2100) return parsed;
		}
		return currentYear;
	});
	const userVillage = villages.find((v) => v.id === user?.village_id);
	const userVillageName = userVillage
		? userVillage.name
		: user?.village_id
			? "Thôn phụ trách"
			: "Toàn xã";

	const [selectedVillage, setSelectedVillage] = useState<string>(
		!isAdmin && user?.village_id ? user.village_id : selectedVillageId || "",
	);

	useEffect(() => {
		if (!isAdmin && user?.village_id) {
			setSelectedVillage(user.village_id);
			setSelectedVillageId(user.village_id);
		} else {
			setSelectedVillage(selectedVillageId || "");
		}
	}, [selectedVillageId, isAdmin, user?.village_id, setSelectedVillageId]);

	const [loading, setLoading] = useState(false);

	const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);
	const [breakdown, setBreakdown] = useState<AnalyticsByVillageResponse | null>(
		null,
	);
	const [demographics, setDemographics] = useState<{
		gender: { male: number; female: number };
		ethnicity: { kinh: number; other: number };
	}>({
		gender: { male: 0, female: 0 },
		ethnicity: { kinh: 0, other: 0 },
	});

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [ovData, bvData, profilesRes, htxhRes] = await Promise.all([
				analyticsApi.getOverview({
					villageId: selectedVillage || undefined,
					calculationYear: selectedYear,
				}),
				analyticsApi.getByVillage({
					calculationYear: selectedYear,
				}),
				profilesApi
					.getProfiles({
						villageId: selectedVillage || undefined,
						limit: 1000,
					})
					.catch(() => null),
				htxhApi
					.getProfiles({
						villageId: selectedVillage || undefined,
						limit: 1000,
					})
					.catch(() => null),
			]);

			setOverview(ovData);
			setBreakdown(bvData);

			const allRecords: any[] = [];
			if (profilesRes && Array.isArray(profilesRes.data)) {
				allRecords.push(...profilesRes.data);
			}
			if (htxhRes && Array.isArray(htxhRes.data)) {
				allRecords.push(...htxhRes.data);
			}

			let male = 0;
			let female = 0;
			let kinh = 0;
			let other = 0;

			allRecords.forEach((p: any) => {
				const g = (p.gender || "").toLowerCase().trim();
				if (g === "nam") male++;
				else if (g === "nữ" || g === "nu") female++;
				else if (g) male++;

				const eth = (p.ethnicity || "").toLowerCase().trim();
				if (eth === "kinh" || eth === "") kinh++;
				else other++;
			});

			setDemographics({
				gender: { male, female },
				ethnicity: { kinh, other },
			});
		} catch (err) {
			console.error("Analytics load error:", err);
		} finally {
			setLoading(false);
		}
	}, [selectedYear, selectedVillage]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const totalCt = overview?.chuctho?.total ?? 0;
	const ctReceived = overview?.chuctho?.received ?? 0;
	const ctUnreceived = overview?.chuctho?.unreceived ?? 0;

	const totalHtxh = overview?.htxh?.total ?? 0;
	const htxhReceived = overview?.htxh?.received ?? 0;
	const htxhUnreceived = overview?.htxh?.unreceived ?? 0;

	const totalAll = totalCt + totalHtxh;
	const totalReceived = ctReceived + htxhReceived;
	const totalUnreceived = ctUnreceived + htxhUnreceived;
	const overallRate =
		totalAll > 0 ? Number(((totalReceived / totalAll) * 100).toFixed(1)) : 0;
	const unreceivedRate =
		totalAll > 0 ? Number(((totalUnreceived / totalAll) * 100).toFixed(1)) : 0;

	const ctAges = [
		{
			label: "Tròn 60 tuổi",
			count: overview?.chuctho?.ageStructure?.age60 ?? 0,
		},
		{
			label: "Tròn 65 tuổi",
			count: overview?.chuctho?.ageStructure?.age65 ?? 0,
		},
		{
			label: "Tròn 70 tuổi",
			count: overview?.chuctho?.ageStructure?.age70 ?? 0,
		},
		{
			label: "Tròn 75 tuổi",
			count: overview?.chuctho?.ageStructure?.age75 ?? 0,
		},
		{
			label: "Tròn 80 tuổi",
			count: overview?.chuctho?.ageStructure?.age80 ?? 0,
		},
		{
			label: "Tròn 85 tuổi",
			count: overview?.chuctho?.ageStructure?.age85 ?? 0,
		},
		{
			label: "Tròn 90 tuổi",
			count: overview?.chuctho?.ageStructure?.age90 ?? 0,
		},
		{
			label: "Tròn 95 tuổi",
			count: overview?.chuctho?.ageStructure?.age95 ?? 0,
		},
		{
			label: "Tròn 100 tuổi",
			count: overview?.chuctho?.ageStructure?.age100 ?? 0,
		},
		{
			label: "Trên 100 tuổi",
			count: overview?.chuctho?.ageStructure?.age_over_100 ?? 0,
		},
	];

	const maxCtCount = Math.max(1, ...ctAges.map((a) => a.count));

	const htxhCategories = [
		{
			label: "Đủ 75 tuổi trở lên",
			count: overview?.htxh?.categories?.age75plus ?? 0,
		},
		{
			label: "70-74 tuổi hộ nghèo/cận nghèo",
			count: overview?.htxh?.categories?.age70to74poor ?? 0,
		},
		{
			label: "Đang hưởng Bảo trợ xã hội",
			count: overview?.htxh?.categories?.bao_tro ?? 0,
		},
		{
			label: "Đang hưởng Hưu trí",
			count: overview?.htxh?.categories?.huu_tri ?? 0,
		},
		{
			label: "Hưu tuất / Bảo hiểm",
			count: overview?.htxh?.categories?.huu_tuat_bao_hiem ?? 0,
		},
		{
			label: "Người có công với cách mạng",
			count: overview?.htxh?.categories?.nguoi_co_cong ?? 0,
		},
	];

	const maxHtxhCount = Math.max(1, ...htxhCategories.map((c) => c.count));

	const currentVillageObj = villages.find(
		(v) => v.id === (selectedVillage || selectedVillageId),
	);
	const currentVillageLabel = currentVillageObj
		? currentVillageObj.name
		: !isAdmin && userVillageName
			? userVillageName
			: "Toàn xã Đăk Hà";

	const handleExportExcel = async () => {
		try {
			const mod = await import("xlsx-js-style");
			const XLSX = (mod as any).default || mod;

			const titleRow = [
				`UBND XÃ ĐĂK HÀ - BẢNG THỐNG KÊ BÁO CÁO ĐỐI SOÁT CHÍNH SÁCH NĂM ${selectedYear}`,
			];
			const emptyRow: any[] = [];
			const headers = [
				"STT",
				"Tên Thôn",
				"Chúc Thọ (Tổng)",
				"Chúc Thọ (Đã nhận)",
				"Chúc Thọ (Chưa nhận)",
				"Tỷ lệ Chúc Thọ (%)",
				"HTXH (Tổng)",
				"HTXH (Đã nhận)",
				"HTXH (Chưa nhận)",
				"Tỷ lệ HTXH (%)",
			];

			const dataRows = (breakdown?.data || []).map((row, idx) => [
				idx + 1,
				row.village_name,
				row.chuctho.total,
				row.chuctho.received,
				row.chuctho.unreceived,
				`${row.chuctho.completionRate}%`,
				row.htxh.total,
				row.htxh.received,
				row.htxh.unreceived,
				`${row.htxh.completionRate}%`,
			]);

			const summary = breakdown?.summary;
			const totalRow = summary
				? [
						"",
						"TỔNG CỘNG TOÀN XÃ",
						summary.chucthoTotal,
						summary.chucthoReceived,
						summary.chucthoUnreceived,
						`${summary.chucthoCompletionRate}%`,
						summary.htxhTotal,
						summary.htxhReceived,
						summary.htxhUnreceived,
						`${summary.htxhCompletionRate}%`,
				  ]
				: [];

			const aoaData = [
				titleRow,
				emptyRow,
				headers,
				...dataRows,
				...(totalRow.length ? [totalRow] : []),
			];
			const ws = XLSX.utils.aoa_to_sheet(aoaData);
			ws["!cols"] = [
				{ wch: 6 },
				{ wch: 22 },
				{ wch: 16 },
				{ wch: 18 },
				{ wch: 18 },
				{ wch: 18 },
				{ wch: 14 },
				{ wch: 16 },
				{ wch: 16 },
				{ wch: 16 },
			];
			ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "ThongKeDoiSoat");
			const filename = `BaoCao_ThongKe_DoiSoat_DakHa_${selectedYear}_${new Date().toISOString().slice(0, 10)}.xlsx`;
			XLSX.writeFile(wb, filename);
		} catch (err) {
			console.error("Export error:", err);
		}
	};

	return (
		<div
			className="space-y-6 animate-in fade-in pb-12 select-none"
			style={{ ["--stat-accent" as any]: STAT_ACCENTS.cs }}
		>
			{/* 1. Thẻ Tiêu Đề Trang: Chuẩn đồng bộ 3 màn (QLCS, QLNN, QLHK) */}
			<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
				<div>
					<div className="flex items-center gap-2.5 flex-wrap">
						<span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
							{currentVillageLabel}
						</span>

						<h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
							<BarChart3
								className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
								strokeWidth={1.5}
							/>
							<span>Thống Kê Báo Cáo & Đối Soát Chính Sách</span>
						</h2>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
						Phân tích số liệu đối tượng Chúc Thọ và Hưu Trí Xã Hội trên địa bàn{" "}
						{isAdmin ? (selectedVillage ? currentVillageLabel : "Xã Đăk Hà") : userVillageName} (Năm {selectedYear})
					</p>
				</div>

				<div className="flex items-center gap-2.5 flex-wrap">
					{isAdmin && (selectedVillageId || selectedVillage) ? (
						<button
							type="button"
							onClick={() => {
								setSelectedVillageId("");
								setSelectedVillage("");
								setActiveTab("villages");
							}}
							aria-label="Quay lại danh sách thôn"
							title="Bấm để chọn thôn khác"
							className="h-10 flex items-center justify-center gap-1.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700"
						>
							<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
							<span>Quay lại danh sách thôn</span>
						</button>
					) : null}

					<button
						type="button"
						onClick={handleExportExcel}
						className="h-10 flex items-center justify-center gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-[0.99] cursor-pointer"
					>
						<Download className="w-4 h-4" strokeWidth={1.5} />
						<span>Xuất Báo Cáo Excel</span>
					</button>

					<button
						type="button"
						onClick={fetchData}
						disabled={loading}
						className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-slate-200 dark:border-slate-700"
						title="Làm mới dữ liệu"
					>
						<RefreshCw
							className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
							strokeWidth={1.5}
						/>
					</button>
				</div>
			</div>

			{/* 2. Thanh Lọc Thời Gian: Chuẩn layout ProfileFilterBar trong bảng quản lý */}
			<div className="relative z-20 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
				<div className="flex items-center gap-2.5 flex-wrap">
					<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">
						<Calendar
							className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
							strokeWidth={1.5}
						/>
						<span>Năm tính toán:</span>
					</div>

					<div className="shrink-0">
						<YearSelector
							year={selectedYear}
							onYearChange={(y) => setSelectedYear(y)}
						/>
					</div>

					{selectedYear !== currentYear && (
						<button
							type="button"
							onClick={() => setSelectedYear(currentYear)}
							className="h-8 sm:h-9 px-2.5 py-1 text-xs rounded-xl flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700/70"
							title="Về năm hiện tại"
						>
							<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
							<span>Về năm {currentYear}</span>
						</button>
					)}
				</div>

				<div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:flex items-center gap-2 pr-1">
					<span>
						Đối soát số liệu và mốc tuổi chính sách theo năm{" "}
						<strong className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
							{selectedYear}
						</strong>
					</span>
				</div>
			</div>

			{/* 2. Thẻ Số Liệu (KPI): 4 thẻ cùng chiều cao, lưới 4 cột (2 cột < 1100px, 1 cột mobile) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-4 gap-6">
				{/* KPI 1: Tổng Đối Tượng */}
				<KpiCard
					label="Tổng Đối Tượng"
					value={totalAll}
					unit="Người"
					subline={`Chúc Thọ: ${formatVietnameseNumber(totalCt)} • HTXH: ${formatVietnameseNumber(totalHtxh)}`}
					icon={
						<Users
							className="w-5 h-5 text-slate-400 dark:text-slate-500"
							strokeWidth={1.5}
						/>
					}
				/>

				{/* KPI 2: Đã Nhận Quà */}
				<KpiCard
					label="Đã Nhận Quà"
					value={totalReceived}
					unit="Người"
					subline={`Đạt ${formatVnPercent(overallRate)} toàn địa bàn`}
					statusDot="success"
					icon={
						<CheckCircle
							className="w-5 h-5 text-slate-400 dark:text-slate-500"
							strokeWidth={1.5}
						/>
					}
				/>

				{/* KPI 3: Chưa Nhận Quà */}
				<KpiCard
					label="Chưa Nhận Quà"
					value={totalUnreceived}
					unit="Người"
					subline={`Còn ${formatVnPercent(unreceivedRate)} đang xử lý`}
					statusDot={totalUnreceived > 0 ? "warning" : "neutral"}
					icon={
						<Clock
							className="w-5 h-5 text-slate-400 dark:text-slate-500"
							strokeWidth={1.5}
						/>
					}
				/>

				{/* KPI 4: Tiến Độ Thực Hiện */}
				<KpiCard
					label="Tiến Độ Thực Hiện"
					value={formatVnPercent(overallRate)}
					progressPercent={overallRate}
					progressColor="var(--stat-accent, #8b5cf6)"
					subline={`Đã hoàn thành ${formatVietnameseNumber(totalReceived)} / ${formatVietnameseNumber(totalAll)} người`}
					icon={
						<TrendingUp
							className="w-5 h-5 text-slate-400 dark:text-slate-500"
							strokeWidth={1.5}
						/>
					}
				/>
			</div>

			{/* 3. Panel Biểu Đồ: MiniDonut Giới tính & Dân tộc (Donut 104px, bên trái legend) */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Panel 1: Cơ Cấu Giới Tính (Nam xanh dương, Nữ hồng) */}
				<ChartPanel
					title="Cơ cấu giới tính"
					subtitle="Tỷ lệ Nam và Nữ trong danh sách chính sách"
					icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
				>
					<MiniDonut
						total={totalAll}
						unit="người"
						items={[
							{
								label: "Nam",
								value: demographics.gender.male,
								color: "#3b82f6",
							},
							{
								label: "Nữ",
								value: demographics.gender.female,
								color: "#ec4899",
							},
						]}
					/>
				</ChartPanel>

				{/* Panel 2: Phân Bổ Dân Tộc (Kinh màu tím chủ đạo, Khác xám trung tính) */}
				<ChartPanel
					title="Phân bổ dân tộc"
					subtitle="Cơ cấu dân tộc Kinh và các dân tộc thiểu số"
					icon={<PieChart className="w-4 h-4" strokeWidth={1.5} />}
				>
					<MiniDonut
						total={totalAll}
						unit="người"
						items={[
							{
								label: "Dân tộc Kinh",
								value: demographics.ethnicity.kinh,
								color: "var(--stat-accent, #8b5cf6)",
							},
							{
								label: "Dân tộc khác",
								value: demographics.ethnicity.other,
								color: "#94a3b8",
							},
						]}
					/>
				</ChartPanel>
			</div>

			{/* 4. Hai Panel Nhóm Tuổi & Diện Hưởng (Dòng có khung riêng chuẩn, thanh tím, đồng bộ cuộn và chiều cao) */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Panel 1: Cơ Cấu 10 Mốc Tuổi Tròn Chúc Thọ */}
				<ChartPanel
					title="Cơ cấu 10 mốc tuổi tròn chúc thọ"
					subtitle={`Tổng cộng: ${formatVietnameseNumber(overview?.chuctho?.total ?? 0)} cụ • ${overview?.chuctho?.completionRate ?? 0}% đã nhận`}
					badge={
						<span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200/60 dark:border-purple-800/60">
							{overview?.chuctho?.completionRate ?? 0}% đã nhận
						</span>
					}
					icon={<Award className="w-4 h-4" strokeWidth={1.5} />}
				>
					<ScrollFadeContainer maxHeight="max-h-[360px]">
						{ctAges.map((item) => (
							<BarRow
								key={item.label}
								label={item.label}
								count={item.count}
								maxOrTotal={maxCtCount}
								unit="cụ"
								color="var(--stat-accent, #8b5cf6)"
							/>
						))}
					</ScrollFadeContainer>
				</ChartPanel>

				{/* Panel 2: Cơ Cấu 6 Diện Hưu Trí Xã Hội */}
				<ChartPanel
					title="Cơ cấu 6 diện hưu trí xã hội"
					subtitle={`Tổng cộng: ${formatVietnameseNumber(overview?.htxh?.total ?? 0)} đối tượng • ${overview?.htxh?.completionRate ?? 0}% đã nhận`}
					badge={
						<span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200/60 dark:border-purple-800/60">
							{overview?.htxh?.completionRate ?? 0}% đã nhận
						</span>
					}
					icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
				>
					<ScrollFadeContainer maxHeight="max-h-[360px]">
						{htxhCategories.map((item) => (
							<BarRow
								key={item.label}
								label={item.label}
								count={item.count}
								maxOrTotal={maxHtxhCount}
								unit="người"
								color="var(--stat-accent, #8b5cf6)"
							/>
						))}
					</ScrollFadeContainer>
				</ChartPanel>
			</div>

			{/* 5. Bảng Đối Soát Các Thôn: Dùng chuẩn bảng danh sách, header trung tính không màu, số font chính tabular-nums */}
			<div className={TABLE_STYLES.card}>
				<div className={TABLE_STYLES.headerBar}>
					<div className="flex items-center gap-2">
						<TrendingUp
							className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
							strokeWidth={1.5}
						/>
						<h3 className={TABLE_STYLES.headerTitle}>
							Bảng Đối Soát Số Liệu Thực Hiện{" "}
							{isAdmin
								? villages.length
									? `${villages.length} Thôn`
									: "Các Thôn"
								: userVillageName}{" "}
							(Năm {selectedYear})
						</h3>
					</div>
					<div className={TABLE_STYLES.headerTip}>
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
						Số liệu đối soát tự động theo năm tính toán {selectedYear}
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full min-w-[960px] text-xs text-left border-collapse whitespace-nowrap">
						<thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)]">
							<tr className="border-b border-slate-200/90 dark:border-slate-700/80">
								<th className="px-4 py-3 text-center w-12 border-b border-slate-200/90 dark:border-slate-700/80">
									STT
								</th>
								<th className="px-4 py-3 border-b border-slate-200/90 dark:border-slate-700/80">
									Địa Bàn Thôn
								</th>
								<th
									className="px-4 py-3 text-center border-b border-slate-200/90 dark:border-slate-700/80"
									colSpan={4}
								>
									Chúc Thọ (Người cao tuổi)
								</th>
								<th
									className="px-4 py-3 text-center border-b border-slate-200/90 dark:border-slate-700/80"
									colSpan={4}
								>
									Hưu Trí Xã Hội
								</th>
							</tr>
							<tr className="border-b border-slate-200/90 dark:border-slate-700/80 text-[11px] font-medium text-slate-500 dark:text-slate-400">
								<th className="px-4 py-2 border-b border-slate-200/90 dark:border-slate-700/80"></th>
								<th className="px-4 py-2 border-b border-slate-200/90 dark:border-slate-700/80"></th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Tổng số
								</th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Đã nhận
								</th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Chưa nhận
								</th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Tỷ lệ
								</th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Tổng số
								</th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Đã nhận
								</th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Chưa nhận
								</th>
								<th className="px-3 py-2 text-right border-b border-slate-200/90 dark:border-slate-700/80">
									Tỷ lệ
								</th>
							</tr>
						</thead>
						<tbody className="font-medium">
							{breakdown?.data && breakdown.data.length > 0 ? (
								breakdown.data.map((row, idx) => (
									<tr
										key={row.village_id || idx}
										className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/80 min-h-[48px]"
									>
										<td className="px-4 py-3 text-center text-xs text-slate-400 dark:text-slate-500 tabular-nums">
											{idx + 1}
										</td>
										<td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
											{row.village_name}
										</td>
										{/* Chúc thọ */}
										<td className="px-3 py-3 text-right font-bold text-slate-800 dark:text-slate-200 tabular-nums">
											{formatVietnameseNumber(row.chuctho.total)}
										</td>
										<td className="px-3 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
											{formatVietnameseNumber(row.chuctho.received)}
										</td>
										<td
											className={`px-3 py-3 text-right font-bold tabular-nums ${
												row.chuctho.unreceived > 0
													? "text-rose-600 dark:text-rose-400"
													: "text-slate-400 dark:text-slate-500"
											}`}
										>
											{formatVietnameseNumber(row.chuctho.unreceived)}
										</td>
										<td className="px-3 py-3 text-right font-bold text-slate-700 dark:text-slate-300 tabular-nums">
											{formatVnPercent(row.chuctho.completionRate)}
										</td>
										{/* HTXH */}
										<td className="px-3 py-3 text-right font-bold text-slate-800 dark:text-slate-200 tabular-nums">
											{formatVietnameseNumber(row.htxh.total)}
										</td>
										<td className="px-3 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
											{formatVietnameseNumber(row.htxh.received)}
										</td>
										<td
											className={`px-3 py-3 text-right font-bold tabular-nums ${
												row.htxh.unreceived > 0
													? "text-rose-600 dark:text-rose-400"
													: "text-slate-400 dark:text-slate-500"
											}`}
										>
											{formatVietnameseNumber(row.htxh.unreceived)}
										</td>
										<td className="px-3 py-3 text-right font-bold text-slate-700 dark:text-slate-300 tabular-nums">
											{formatVnPercent(row.htxh.completionRate)}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={10}
										className="py-8 text-center text-slate-400 italic"
									>
										Chưa có số liệu đối soát cho năm {selectedYear}.
									</td>
								</tr>
							)}
						</tbody>
						{/* Dòng Tổng Toàn Xã */}
						{breakdown?.summary && (
							<tfoot className="bg-slate-100/90 dark:bg-slate-800/90 font-black text-xs border-t-2 border-slate-300 dark:border-slate-700">
								<tr>
									<td
										className="px-4 py-3 text-center font-bold uppercase text-emerald-700 dark:text-emerald-300"
										colSpan={2}
									>
										TỔNG CỘNG TOÀN XÃ
									</td>
									<td className="px-3 py-3 text-right text-slate-900 dark:text-white tabular-nums">
										{formatVietnameseNumber(breakdown.summary.chucthoTotal)}
									</td>
									<td className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
										{formatVietnameseNumber(breakdown.summary.chucthoReceived)}
									</td>
									<td
										className={`px-3 py-3 text-right tabular-nums ${
											breakdown.summary.chucthoUnreceived > 0
												? "text-rose-600 dark:text-rose-400"
												: "text-slate-400 dark:text-slate-500"
										}`}
									>
										{formatVietnameseNumber(
											breakdown.summary.chucthoUnreceived,
										)}
									</td>
									<td className="px-3 py-3 text-right text-slate-900 dark:text-white tabular-nums">
										{formatVnPercent(breakdown.summary.chucthoCompletionRate)}
									</td>
									<td className="px-3 py-3 text-right text-slate-900 dark:text-white tabular-nums">
										{formatVietnameseNumber(breakdown.summary.htxhTotal)}
									</td>
									<td className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
										{formatVietnameseNumber(breakdown.summary.htxhReceived)}
									</td>
									<td
										className={`px-3 py-3 text-right tabular-nums ${
											breakdown.summary.htxhUnreceived > 0
												? "text-rose-600 dark:text-rose-400"
												: "text-slate-400 dark:text-slate-500"
										}`}
									>
										{formatVietnameseNumber(
											breakdown.summary.htxhUnreceived,
										)}
									</td>
									<td className="px-3 py-3 text-right text-slate-900 dark:text-white tabular-nums">
										{formatVnPercent(breakdown.summary.htxhCompletionRate)}
									</td>
								</tr>
							</tfoot>
						)}
					</table>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsPage;
