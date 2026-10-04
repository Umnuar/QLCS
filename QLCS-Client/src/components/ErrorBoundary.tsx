import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("[ErrorBoundary]", error, errorInfo);
	}

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "100vh",
						padding: "20px",
						textAlign: "center",
						fontFamily: "sans-serif",
					}}
				>
					<h1 style={{ color: "#e53e3e", marginBottom: "12px" }}>
						Đã xảy ra lỗi
					</h1>
					<p
						style={{
							color: "#4a5568",
							marginBottom: "20px",
							maxWidth: "500px",
						}}
					>
						Ứng dụng đã gặp sự cố. Vui lòng tải lại trang hoặc liên hệ quản trị
						viên.
					</p>
					<pre
						style={{
							background: "#f7fafc",
							border: "1px solid #e2e8f0",
							borderRadius: "8px",
							padding: "16px",
							maxWidth: "600px",
							overflow: "auto",
							fontSize: "13px",
							color: "#2d3748",
							textAlign: "left",
							marginBottom: "20px",
						}}
					>
						{this.state.error?.message}
						{"\n\n"}
						{this.state.error?.stack}
					</pre>
					<button
						onClick={() => window.location.reload()}
						style={{
							padding: "10px 24px",
							background: "#3182ce",
							color: "white",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
							fontSize: "15px",
						}}
					>
						Tải lại trang
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
