import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppProviders } from "@/AppProviders";

const RootLayout = () => {
	return (
		<AppProviders>
			<Outlet />
		</AppProviders>
	);
};

export const Route = createRootRoute({
	component: RootLayout,
});
