import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { i as TrendingUp, m as Coins, n as Users, y as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BgnjmoBP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		fetchDashboardData();
	}, []);
	const fetchDashboardData = async () => {
		try {
			const result = await (await fetch("/api/dashboard", { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } })).json();
			setData(result);
		} catch (error) {
			console.error("Failed to fetch dashboard data");
		} finally {
			setLoading(false);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-muted-foreground",
			children: "Loading dashboard..."
		})
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-red-400",
			children: "Failed to load dashboard"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-9 w-9 place-items-center rounded-md bg-gold-gradient text-primary-foreground font-display font-bold shadow-[var(--shadow-gold)]",
						children: "JJ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold tracking-tight text-gold",
						children: "John James Projects"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/dashboard",
							className: "text-sm font-medium text-gold",
							children: "Dashboard"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/dashboard/invest",
							className: "text-sm text-muted-foreground hover:text-foreground",
							children: "Invest"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/affiliate",
							className: "text-sm text-muted-foreground hover:text-foreground",
							children: "Affiliate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-sm text-muted-foreground hover:text-foreground",
							children: "Sign Out"
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-7xl px-6 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-bold",
						children: "Dashboard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-muted-foreground",
						children: ["Welcome back, ", data.user.username]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Coins,
							label: "Total Shares",
							value: data.portfolio.total_shares.toLocaleString(),
							subtext: `$${data.portfolio.total_invested.toLocaleString()} invested`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: TrendingUp,
							label: "Portfolio Value",
							value: `$${data.portfolio.current_value.toLocaleString()}`,
							subtext: "Current valuation",
							trend: "+12.5%"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Coins,
							label: "Total Commissions",
							value: `$${data.commissions.total_earned.toLocaleString()}`,
							subtext: `$${data.commissions.pending.toLocaleString()} pending`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Users,
							label: "Referrals",
							value: data.referrals.direct.toString(),
							subtext: `${data.referrals.total_team} total team`
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-6 lg:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-2 rounded-2xl border border-border bg-card p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-semibold",
								children: "Investment Overview"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between border-b border-border/50 pb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted-foreground",
											children: "Shares Owned"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-lg font-semibold",
											children: data.portfolio.total_shares.toLocaleString()
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between border-b border-border/50 pb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted-foreground",
											children: "Total Invested"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-display text-lg font-semibold",
											children: ["$", data.portfolio.total_invested.toLocaleString()]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted-foreground",
											children: "Current Value"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-display text-lg font-semibold text-gold",
											children: ["$", data.portfolio.current_value.toLocaleString()]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "/dashboard/invest",
								className: "mt-6 inline-flex items-center gap-2 rounded-md bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5",
								children: ["Purchase More Shares ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-semibold",
								children: "Referral Code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 rounded-lg bg-background/60 p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs uppercase tracking-widest text-muted-foreground",
									children: "Your Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 font-display text-2xl font-bold text-gold",
									children: data.user.referral_code
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/affiliate",
								className: "mt-6 block w-full rounded-md border border-gold/50 px-6 py-3 text-center font-semibold text-gold transition-colors hover:bg-gold/10",
								children: "View Affiliate Dashboard"
							})
						]
					})]
				})
			]
		})]
	});
}
function StatCard({ icon: Icon, label, value, subtext, trend }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-6 w-6" })
			}), trend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold text-emerald-400",
				children: trend
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-widest text-muted-foreground",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 font-display text-2xl font-bold",
					children: value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-xs text-muted-foreground",
					children: subtext
				})
			]
		})]
	});
}
//#endregion
export { DashboardPage as component };
