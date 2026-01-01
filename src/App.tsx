import { Timer } from "./components/Timer";

function App() {
	return (
		<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
			<div className="w-full max-w-4xl">
				<header className="mb-12 text-center">
					<h1 className="text-4xl font-bold text-white mb-2 tracking-tight">FlowBase</h1>
					<p className="text-slate-400">Distraction-free focus station</p>
				</header>

				<main>
					<Timer focusDuration={25 * 60} />
				</main>
			</div>
		</div>
	);
}

export default App;