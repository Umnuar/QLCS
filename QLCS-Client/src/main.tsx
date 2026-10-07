import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppContextProvider } from "./AppContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

console.log("[Renderer] Mounting app...");

const rootEl = document.getElementById("root");
if (!rootEl) {
	document.body.innerHTML =
		'<pre style="color:red;padding:20px;font-size:14px">FATAL ERROR: Root element not found</pre>';
} else {
	ReactDOM.createRoot(rootEl).render(
		<React.StrictMode>
			<ErrorBoundary>
				<AppContextProvider>
					<App />
				</AppContextProvider>
			</ErrorBoundary>
		</React.StrictMode>,
	);
}

