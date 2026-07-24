import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-BuMNqS3c.js
var $$splitComponentImporter = () => import("./register-BMaUTNlD.mjs");
var Route = createFileRoute("/auth/register")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => {
		return { ref: search.ref || "" };
	}
});
//#endregion
export { Route as t };
