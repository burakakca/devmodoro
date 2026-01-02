import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

/**
 * Hook to check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animation presets that respect reduced motion preferences
 */
export const animations = {
	/** Fade in from transparent */
	fadeIn: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	},
	/** Slide in from the right */
	slideInRight: {
		initial: { opacity: 0, x: 20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -20 },
	},
	/** Slide in from the left */
	slideInLeft: {
		initial: { opacity: 0, x: -20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 20 },
	},
	/** Slide in from the bottom */
	slideInUp: {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -20 },
	},
	/** Slide in from the top */
	slideInDown: {
		initial: { opacity: 0, y: -20 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: 20 },
	},
	/** Scale up from smaller size */
	scaleIn: {
		initial: { opacity: 0, scale: 0.9 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.9 },
	},
	/** Scale down to smaller size */
	scaleOut: {
		initial: { opacity: 0, scale: 1.1 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 1.1 },
	},
} as const;

export type AnimationType = keyof typeof animations;

interface AnimatedContainerProps {
	children: ReactNode;
	animation?: AnimationType;
	delay?: number;
	duration?: number;
	className?: string;
}

/**
 * Reusable animated container wrapper
 */
export function AnimatedContainer({
	children,
	animation = "fadeIn",
	delay = 0,
	duration = 0.3,
	className,
}: AnimatedContainerProps) {
	const reducedMotion = useReducedMotion();
	const preset = animations[animation];

	// If reduced motion is preferred, just render children without animation
	if (reducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={preset.initial}
			animate={preset.animate}
			exit={preset.exit}
			transition={{
				duration,
				delay,
				ease: "easeOut",
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

/**
 * Staggered list animation variants for parent container
 */
export const staggerContainerVariants: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

/**
 * Staggered list animation variants for child items
 */
export const staggerItemVariants: Variants = {
	hidden: { opacity: 0, y: 10 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		x: -20,
		transition: {
			duration: 0.2,
		},
	},
};

interface AnimatedListProps {
	children: ReactNode;
	className?: string;
}

/**
 * Container for staggered list animations
 */
export function AnimatedList({ children, className }: AnimatedListProps) {
	const reducedMotion = useReducedMotion();

	if (reducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			variants={staggerContainerVariants}
			initial="hidden"
			animate="show"
			className={className}
		>
			{children}
		</motion.div>
	);
}

interface AnimatedListItemProps {
	children: ReactNode;
	className?: string;
	layoutId?: string;
}

/**
 * Individual item in a staggered list
 */
export function AnimatedListItem({
	children,
	className,
	layoutId,
}: AnimatedListItemProps) {
	const reducedMotion = useReducedMotion();

	if (reducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			variants={staggerItemVariants}
			layout
			layoutId={layoutId}
			className={className}
		>
			{children}
		</motion.div>
	);
}

interface AnimatedButtonProps {
	children: ReactNode;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	"aria-label"?: string;
}

/**
 * Animated button with hover and tap effects
 */
export function AnimatedButton({
	children,
	className,
	onClick,
	disabled,
	type = "button",
	"aria-label": ariaLabel,
}: AnimatedButtonProps) {
	const reducedMotion = useReducedMotion();

	if (reducedMotion) {
		return (
			<button
				type={type}
				className={`${className} focus:outline-none focus:ring-2 focus:ring-primary`}
				onClick={onClick}
				disabled={disabled}
				aria-label={ariaLabel}
			>
				{children}
			</button>
		);
	}

	return (
		<motion.button
			type={type}
			className={`${className} focus:outline-none focus:ring-2 focus:ring-primary`}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			transition={{ duration: 0.15 }}
		>
			{children}
		</motion.button>
	);
}

/**
 * Celebration animation for task/pomodoro completion
 */
interface CelebrationProps {
	show: boolean;
	onComplete?: () => void;
}

export function Celebration({ show, onComplete }: CelebrationProps) {
	const reducedMotion = useReducedMotion();
	const [isVisible, setIsVisible] = useState(false);

	// Auto-hide celebration after animation plays
	useEffect(() => {
		if (show) {
			setIsVisible(true);
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, 1500); // Hide after 1.5 seconds
			return () => clearTimeout(timer);
		}
	}, [show]);

	// Call onComplete when exit animation finishes
	const handleExitComplete = () => {
		onComplete?.();
	};

	if (reducedMotion) {
		// For reduced motion, just briefly show and hide
		if (show && !isVisible) {
			onComplete?.();
		}
		return null;
	}

	return (
		<AnimatePresence onExitComplete={handleExitComplete}>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
				>
					{/* Radial pulse */}
					<motion.div
						initial={{ scale: 0, opacity: 0.8 }}
						animate={{
							scale: [0, 2],
							opacity: [0.8, 0],
						}}
						transition={{
							duration: 0.8,
							ease: "easeOut",
						}}
						className="absolute w-64 h-64 rounded-full bg-primary"
					/>

					{/* Success checkmark */}
					<motion.div
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, opacity: 0 }}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 15,
						}}
						className="w-20 h-20 bg-success rounded-full flex items-center justify-center shadow-lg"
					>
						<motion.svg
							width={40}
							height={40}
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--color-background)"
							strokeWidth={3}
							strokeLinecap="round"
							strokeLinejoin="round"
							role="img"
							aria-labelledby="success-icon-title"
						>
							<title id="success-icon-title">Success checkmark</title>
							<motion.path
								d="M5 12l5 5L19 7"
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: 0.4, delay: 0.2 }}
							/>
						</motion.svg>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// Re-export AnimatePresence for convenience
export { AnimatePresence };
