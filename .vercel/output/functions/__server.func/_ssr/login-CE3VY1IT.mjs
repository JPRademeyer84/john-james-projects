import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as auth } from "./supabase-DGywpjYD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CE3VY1IT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = (0, import_react.useState)({
		email: "",
		password: ""
	});
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const data = await auth.signIn(formData.email, formData.password);
			localStorage.setItem("auth_token", data.session?.access_token || "");
			navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
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
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								children: "Sign In"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Access your John James Projects account"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
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
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
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
									placeholder: "Enter password"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										className: "rounded border-border"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Remember me"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth/forgot-password",
									className: "text-gold hover:text-gold/80",
									children: "Forgot password?"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: loading,
								className: "w-full rounded-lg bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed",
								children: loading ? "Signing in..." : "Sign In"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 text-center text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Don't have an account? "
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth/register",
							className: "font-semibold text-gold hover:text-gold/80",
							children: "Create account"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 border-t border-border pt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-xs text-muted-foreground",
							children: "Existing Aureus.africa user? Your account works here automatically."
						})
					})
				]
			})
		})
	});
}
//#endregion
export { LoginPage as component };
