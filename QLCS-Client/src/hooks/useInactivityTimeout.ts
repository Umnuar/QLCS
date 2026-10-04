import { useCallback, useEffect, useRef } from "react";

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút

export function useInactivityTimeout(
	onTimeout: () => void,
	isEnabled: boolean = true,
	timeoutMinutes: number = 30,
) {
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const onTimeoutRef = useRef(onTimeout);
	const lastActivityRef = useRef(0);

	useEffect(() => {
		onTimeoutRef.current = onTimeout;
	}, [onTimeout]);

	const resetTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		if (isEnabled) {
			const ms = timeoutMinutes * 60 * 1000 || DEFAULT_TIMEOUT_MS;
			timerRef.current = setTimeout(() => {
				console.warn(
					`[Session] Hết thời gian chờ phiên ${timeoutMinutes} phút không hoạt động -> Tự động đăng xuất.`,
				);
				onTimeoutRef.current();
			}, ms);
		}
	}, [isEnabled, timeoutMinutes]);

	useEffect(() => {
		if (!isEnabled) return;

		const events = [
			"mousedown",
			"mousemove",
			"keydown",
			"scroll",
			"touchstart",
			"click",
		];
		const handleActivity = () => {
			const now = Date.now();
			if (now - lastActivityRef.current > 2000) {
				lastActivityRef.current = now;
				resetTimer();
			}
		};

		events.forEach((evt) => window.addEventListener(evt, handleActivity));
		resetTimer();

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			events.forEach((evt) => window.removeEventListener(evt, handleActivity));
		};
	}, [isEnabled, resetTimer]);
}
