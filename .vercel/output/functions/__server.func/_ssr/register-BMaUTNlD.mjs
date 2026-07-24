import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as auth } from "./supabase-DGywpjYD.mjs";
import { t as Route } from "./register-BuMNqS3c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-BMaUTNlD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RegisterPage() {
	const navigate = useNavigate();
	const { ref } = Route.useSearch();
	const [formData, setFormData] = (0, import_react.useState)({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		sponsorCode: ref || ""
	});
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [agreed, setAgreed] = (0, import_react.useState)(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		if (!agreed) {
			setError("Please accept the terms and conditions");
			return;
		}
		setLoading(true);
		try {
			const data = await auth.signUp(formData.email, formData.password, formData.username, formData.sponsorCode || void 0);
			localStorage.setItem("auth_token", data.session?.access_token || "");
			navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background text-foreground font-body",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-screen items-center justify-center px-6 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "inline-flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-12 w-12 place-items-center rounded-lg bg-gold-gradient text-primary-foreground font-display font-bold shadow-[var(--shadow-gold)]",
								children: "JJ"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 font-display text-3xl font-bold",
							children: "Create Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Join the John James Projects offering"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-8 space-y-6",
					children: [
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg bg-red-500/10 border border-red-500/20 p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-red-400",
								children: error
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "username",
									className: "block text-sm font-medium mb-2",
									children: "Username"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "username",
									type: "text",
									required: true,
									value: formData.username,
									onChange: (e) => setFormData({
										...formData,
										username: e.target.value
									}),
									className: "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold",
									placeholder: "johndoe"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "email",
									className: "block text-sm font-medium mb-2",
									children: "Email Address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "email",
									type: "email",
									required: true,
									value: formData.email,
									onChange: (e) => setFormData({
										...formData,
										email: e.target.value
									}),
									className: "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold",
									placeholder: "you@example.com"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "password",
									className: "block text-sm font-medium mb-2",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "password",
									type: "password",
									required: true,
									value: formData.password,
									onChange: (e) => setFormData({
										...formData,
										password: e.target.value
									}),
									className: "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold",
									placeholder: "Minimum 8 characters"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "confirmPassword",
									className: "block text-sm font-medium mb-2",
									children: "Confirm Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "confirmPassword",
									type: "password",
									required: true,
									value: formData.confirmPassword,
									onChange: (e) => setFormData({
										...formData,
										confirmPassword: e.target.value
									}),
									className: "w-full rounded-lg border border-border bg-surface px-4 py-3",
									placeholder: "Re-enter password"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							className: "w-full rounded-lg bg-gold-gradient px-6 py-3 font-semibold",
							children: loading ? "Creating account..." : "Create Account"
						})
					]
				})]
			})
		})
	});
}
//#endregion
export { RegisterPage as component };
