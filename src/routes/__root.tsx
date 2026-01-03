import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppProviders } from "@/AppProviders";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

const RootLayout = () => {
	return (
		<AppProviders>
			<Outlet />
		</AppProviders>
	);
};

export const Route = createRootRoute({
	component: RootLayout,
	notFoundComponent: NotFoundPage,
	errorComponent: ErrorPage,
});
