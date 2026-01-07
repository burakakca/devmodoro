import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	BarChart3,
	Brain,
	CheckCircle2,
	Clock,
	Coffee,
	Github,
	Lightbulb,
	Music,
	Rocket,
	Target,
	Timer,
	Zap,
} from "lucide-react";

export const Route = createFileRoute("/about")({
	component: AboutPage,
	head: () => ({
		meta: [
			{
				title: "About Devmodoro - Pomodoro Timer for Developers",
			},
			{
				name: "description",
				content:
					"Learn about Devmodoro, the Pomodoro technique, and how to boost your productivity as a developer. Master time management with focused work sessions.",
			},
			{
				name: "keywords",
				content:
					"pomodoro technique, pomodoro timer, developer productivity, focus timer, time management, devmodoro",
			},
			{
				property: "og:title",
				content: "About Devmodoro - Pomodoro Timer for Developers",
			},
			{
				property: "og:description",
				content:
					"Learn about Devmodoro, the Pomodoro technique, and how to boost your productivity as a developer.",
			},
			{
				property: "og:type",
				content: "article",
			},
		],
	}),
});

function AboutPage() {
	return (
		<div className="min-h-screen bg-theme-bg p-4 lg:p-8">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
			>
				Skip to main content
			</a>

			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<header className="mb-8 flex items-center gap-4">
					<Link
						to="/"
						className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
						aria-label="Back to timer"
					>
						<ArrowLeft className="w-6 h-6" aria-hidden="true" />
					</Link>
					<div className="flex items-center gap-3">
						<img
							src="/favicon.svg"
							alt=""
							className="w-8 h-8 lg:w-10 lg:h-10"
						/>
						<div>
							<h1 className="text-2xl lg:text-3xl font-bold text-theme-text tracking-tight leading-none">
								About Devmodoro
							</h1>
							<p className="text-theme-text-secondary text-sm">
								Your productivity companion
							</p>
						</div>
					</div>
				</header>

				<main id="main-content" className="space-y-8">
					{/* Hero Section */}
					<section
						className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20"
						aria-labelledby="hero-heading"
					>
						<div className="text-center max-w-2xl mx-auto">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4">
								<Rocket className="w-8 h-8 text-primary" aria-hidden="true" />
							</div>
							<h2
								id="hero-heading"
								className="text-2xl lg:text-3xl font-bold text-theme-text mb-4"
							>
								Master Your Focus, Ship More Code
							</h2>
							<p className="text-theme-text-secondary text-lg leading-relaxed">
								Devmodoro is a developer-focused productivity station that
								combines the proven Pomodoro Technique with tools designed
								specifically for software developers.
							</p>
						</div>
					</section>

					{/* What is Devmodoro */}
					<section
						className="bg-theme-bg-secondary rounded-2xl p-6 lg:p-8 border border-theme-border shadow-sm"
						aria-labelledby="what-is-devmodoro"
					>
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-primary/10 rounded-xl shrink-0">
								<Target className="w-6 h-6 text-primary" aria-hidden="true" />
							</div>
							<div>
								<h2
									id="what-is-devmodoro"
									className="text-xl lg:text-2xl font-bold text-theme-text mb-2"
								>
									What is Devmodoro?
								</h2>
								<p className="text-theme-text-secondary">
									Your all-in-one productivity station
								</p>
							</div>
						</div>

						<div className="space-y-4 text-theme-text-secondary leading-relaxed">
							<p>
								Devmodoro is a modern, open-source productivity application
								built specifically for developers. It combines the time-tested
								Pomodoro Technique with powerful features that integrate
								seamlessly into your development workflow.
							</p>
							<p>
								Unlike generic timer apps, Devmodoro understands how developers
								work. It includes GitHub integration for managing issues as
								tasks, ambient sound mixing for optimal focus, and detailed
								analytics to help you understand and improve your productivity
								patterns.
							</p>
						</div>

						{/* Features Grid */}
						<div className="grid sm:grid-cols-2 gap-4 mt-6">
							<FeatureCard
								icon={<Timer className="w-5 h-5" />}
								title="Smart Timer"
								description="Customizable work and break intervals with visual and audio notifications"
							/>
							<FeatureCard
								icon={<Github className="w-5 h-5" />}
								title="GitHub Integration"
								description="Import and work on GitHub issues directly from your timer"
							/>
							<FeatureCard
								icon={<Music className="w-5 h-5" />}
								title="Ambient Sounds"
								description="Mix ambient sounds like rain, coffee shop, or lo-fi beats"
							/>
							<FeatureCard
								icon={<BarChart3 className="w-5 h-5" />}
								title="Analytics"
								description="Track your productivity with detailed session analytics"
							/>
						</div>
					</section>

					{/* What is Pomodoro */}
					<section
						className="bg-theme-bg-secondary rounded-2xl p-6 lg:p-8 border border-theme-border shadow-sm"
						aria-labelledby="what-is-pomodoro"
					>
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-primary/10 rounded-xl shrink-0">
								<Brain className="w-6 h-6 text-primary" aria-hidden="true" />
							</div>
							<div>
								<h2
									id="what-is-pomodoro"
									className="text-xl lg:text-2xl font-bold text-theme-text mb-2"
								>
									What is the Pomodoro Technique?
								</h2>
								<p className="text-theme-text-secondary">
									A proven time management method
								</p>
							</div>
						</div>

						<div className="space-y-4 text-theme-text-secondary leading-relaxed">
							<p>
								The Pomodoro Technique is a time management method developed by
								Francesco Cirillo in the late 1980s. Named after the
								tomato-shaped kitchen timer (pomodoro means tomato in Italian),
								this technique has helped millions of people improve their focus
								and productivity.
							</p>
							<p>
								The core principle is simple: work in focused intervals
								(traditionally 25 minutes) followed by short breaks. After
								completing four intervals, take a longer break. This rhythm
								helps maintain high levels of focus while preventing mental
								fatigue.
							</p>
						</div>

						{/* Pomodoro Steps */}
						<div className="mt-6 space-y-3">
							<h3 className="font-semibold text-theme-text mb-4">
								The Classic Pomodoro Cycle
							</h3>
							<StepItem
								number={1}
								title="Choose a task"
								description="Select one specific task to focus on"
							/>
							<StepItem
								number={2}
								title="Set the timer"
								description="Start a 25-minute focused work session"
							/>
							<StepItem
								number={3}
								title="Work until the timer rings"
								description="Focus solely on your task without distractions"
							/>
							<StepItem
								number={4}
								title="Take a short break"
								description="Rest for 5 minutes to recharge"
							/>
							<StepItem
								number={5}
								title="Every 4 pomodoros, take a longer break"
								description="After 4 cycles, take a 15-30 minute break"
							/>
						</div>
					</section>

					{/* How to Use */}
					<section
						className="bg-theme-bg-secondary rounded-2xl p-6 lg:p-8 border border-theme-border shadow-sm"
						aria-labelledby="how-to-use"
					>
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-primary/10 rounded-xl shrink-0">
								<Lightbulb
									className="w-6 h-6 text-primary"
									aria-hidden="true"
								/>
							</div>
							<div>
								<h2
									id="how-to-use"
									className="text-xl lg:text-2xl font-bold text-theme-text mb-2"
								>
									How to Use Devmodoro
								</h2>
								<p className="text-theme-text-secondary">
									Get started in minutes
								</p>
							</div>
						</div>

						<div className="space-y-6">
							<HowToStep
								icon={<CheckCircle2 className="w-5 h-5" />}
								title="1. Add Your Tasks"
								description="Create tasks manually or connect your GitHub account to import issues. Each task can have an estimated number of pomodoros to help you plan your day."
							/>
							<HowToStep
								icon={<Clock className="w-5 h-5" />}
								title="2. Select a Task and Start the Timer"
								description="Click on a task to select it, then press the play button to start your focus session. The timer will count down and notify you when it's time for a break."
							/>
							<HowToStep
								icon={<Coffee className="w-5 h-5" />}
								title="3. Take Breaks"
								description="When the work session ends, take your break! Step away from the screen, stretch, or grab a coffee. The short breaks are essential for maintaining productivity."
							/>
							<HowToStep
								icon={<Music className="w-5 h-5" />}
								title="4. Customize Your Environment"
								description="Use the sound mixer to create your perfect focus environment. Combine rain sounds, coffee shop ambiance, or lo-fi beats to block out distractions."
							/>
							<HowToStep
								icon={<BarChart3 className="w-5 h-5" />}
								title="5. Review Your Analytics"
								description="Check your analytics to see your productivity trends, completed pomodoros, and time spent on different tasks. Use these insights to optimize your workflow."
							/>
						</div>
					</section>

					{/* Benefits */}
					<section
						className="bg-theme-bg-secondary rounded-2xl p-6 lg:p-8 border border-theme-border shadow-sm"
						aria-labelledby="benefits"
					>
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-primary/10 rounded-xl shrink-0">
								<Zap className="w-6 h-6 text-primary" aria-hidden="true" />
							</div>
							<div>
								<h2
									id="benefits"
									className="text-xl lg:text-2xl font-bold text-theme-text mb-2"
								>
									Benefits of Using Devmodoro
								</h2>
								<p className="text-theme-text-secondary">
									Why developers love it
								</p>
							</div>
						</div>

						<ul className="grid sm:grid-cols-2 gap-4">
							<BenefitItem text="Reduce mental fatigue with structured breaks" />
							<BenefitItem text="Improve focus by working in short bursts" />
							<BenefitItem text="Track time spent on different projects" />
							<BenefitItem text="Build consistent work habits" />
							<BenefitItem text="Combat procrastination with clear goals" />
							<BenefitItem text="Maintain work-life balance" />
							<BenefitItem text="Integrate with your GitHub workflow" />
							<BenefitItem text="Create the perfect focus environment" />
						</ul>
					</section>

					{/* Pro Tips */}
					<section
						className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 lg:p-8 border border-primary/20"
						aria-labelledby="pro-tips"
					>
						<h2
							id="pro-tips"
							className="text-xl lg:text-2xl font-bold text-theme-text mb-6"
						>
							Pro Tips for Maximum Productivity
						</h2>
						<ul className="space-y-3 text-theme-text-secondary">
							<li className="flex items-start gap-3">
								<span
									className="text-primary font-bold shrink-0"
									aria-hidden="true"
								>
									→
								</span>
								<span>
									<strong className="text-theme-text">
										Start with small tasks:
									</strong>{" "}
									If you're new to Pomodoro, begin with simple tasks to build
									the habit before tackling complex coding challenges.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span
									className="text-primary font-bold shrink-0"
									aria-hidden="true"
								>
									→
								</span>
								<span>
									<strong className="text-theme-text">
										Estimate pomodoros:
									</strong>{" "}
									Before starting, estimate how many pomodoros a task will take.
									This improves planning and helps you recognize patterns.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span
									className="text-primary font-bold shrink-0"
									aria-hidden="true"
								>
									→
								</span>
								<span>
									<strong className="text-theme-text">
										Protect your pomodoro:
									</strong>{" "}
									If interrupted, either end the pomodoro or postpone the
									interruption. Partial pomodoros don't count!
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span
									className="text-primary font-bold shrink-0"
									aria-hidden="true"
								>
									→
								</span>
								<span>
									<strong className="text-theme-text">
										Use breaks wisely:
									</strong>{" "}
									Step away from your desk during breaks. Don't check emails or
									social media—give your brain a real rest.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span
									className="text-primary font-bold shrink-0"
									aria-hidden="true"
								>
									→
								</span>
								<span>
									<strong className="text-theme-text">
										Review your analytics:
									</strong>{" "}
									Check your productivity patterns weekly. You might discover
									you're most productive at certain times of day.
								</span>
							</li>
						</ul>
					</section>

					{/* CTA */}
					<section className="text-center py-8">
						<h2 className="text-xl lg:text-2xl font-bold text-theme-text mb-4">
							Ready to Boost Your Productivity?
						</h2>
						<p className="text-theme-text-secondary mb-6">
							Start your first pomodoro session now and experience the
							difference.
						</p>
						<Link
							to="/"
							className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-theme-bg"
						>
							<Timer className="w-5 h-5" aria-hidden="true" />
							Start Timer
						</Link>
					</section>
				</main>
			</div>
		</div>
	);
}

// Helper Components

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="flex items-start gap-3 p-4 bg-theme-bg-tertiary rounded-xl">
			<div className="text-primary shrink-0" aria-hidden="true">
				{icon}
			</div>
			<div>
				<h3 className="font-semibold text-theme-text mb-1">{title}</h3>
				<p className="text-theme-text-secondary text-sm">{description}</p>
			</div>
		</div>
	);
}

function StepItem({
	number,
	title,
	description,
}: {
	number: number;
	title: string;
	description: string;
}) {
	return (
		<div className="flex items-start gap-4 p-4 bg-theme-bg-tertiary rounded-xl">
			<div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shrink-0">
				{number}
			</div>
			<div>
				<h4 className="font-semibold text-theme-text">{title}</h4>
				<p className="text-theme-text-secondary text-sm">{description}</p>
			</div>
		</div>
	);
}

function HowToStep({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="flex items-start gap-4">
			<div
				className="p-2 bg-primary/10 rounded-lg text-primary shrink-0"
				aria-hidden="true"
			>
				{icon}
			</div>
			<div>
				<h3 className="font-semibold text-theme-text mb-1">{title}</h3>
				<p className="text-theme-text-secondary text-sm leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	);
}

function BenefitItem({ text }: { text: string }) {
	return (
		<li className="flex items-center gap-3 p-3 bg-theme-bg-tertiary rounded-xl">
			<CheckCircle2
				className="w-5 h-5 text-green-500 shrink-0"
				aria-hidden="true"
			/>
			<span className="text-theme-text-secondary text-sm">{text}</span>
		</li>
	);
}
