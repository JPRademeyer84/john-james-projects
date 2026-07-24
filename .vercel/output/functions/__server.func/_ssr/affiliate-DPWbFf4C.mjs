import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as ArrowLeft, f as DollarSign, g as CircleCheckBig, i as TrendingUp, n as Users, p as Copy } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/affiliate-DPWbFf4C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AffiliatePage() {
	const [data, setData] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		fetchAffiliateData();
	}, []);
	const fetchAffiliateData = async () => {
		try {
			const result = await (await fetch("/api/affiliate/dashboard", { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } })).json();
			setData(result);
		} catch (error) {
			console.error("Failed to fetch affiliate data");
		} finally {
			setLoading(false);
		}
	};
	const copyReferralLink = () => {
		if (data) {
			navigator.clipboard.writeText(data.referral_link);
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-muted-foreground",
			children: "Loading affiliate dashboard..."
		})
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-red-400",
			children: "Failed to load affiliate data"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard",
					className: "flex items-center gap-2 text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: "Back to Dashboard"
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-7xl px-6 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-bold",
						children: "Affiliate Dashboard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: "Earn 10% USDT + 5% shares on every referral"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8 rounded-2xl border border-gold/30 bg-gold/5 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold mb-4",
							children: "Your Referral Link"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								readOnly: true,
								value: data.referral_link,
								className: "flex-1 rounded-lg border border-gold/20 bg-background/60 px-4 py-3 text-sm font-mono text-foreground"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: copyReferralLink,
								className: "flex items-center gap-2 rounded-lg bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5",
								children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" }), copied ? "Copied!" : "Copy"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-muted-foreground",
							children: "Share this link to earn commissions on every investment made through it"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: Users,
							label: "Direct Referrals",
							value: data.stats.direct_referrals.toString(),
							subtext: "Active members"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: TrendingUp,
							label: "Total Team",
							value: data.stats.total_team.toString(),
							subtext: "Including downline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: DollarSign,
							label: "Total Earned",
							value: `$${data.stats.total_earned.toLocaleString()}`,
							subtext: "All-time commissions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: DollarSign,
							label: "Pending",
							value: `$${data.stats.pending_commissions.toLocaleString()}`,
							subtext: "Awaiting approval",
							highlight: true
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold mb-6",
							children: "Recent Referrals"
						}), data.recent_referrals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-muted-foreground py-8",
							children: "No referrals yet"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: data.recent_referrals.map((referral, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-border/50 pb-3 last:border-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: referral.username
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["Joined ", new Date(referral.joined_at).toLocaleDateString()]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-semibold text-gold",
										children: ["$", referral.total_invested.toLocaleString()]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Total invested"
									})]
								})]
							}, idx))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold mb-6",
							children: "Commission History"
						}), data.commissions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-muted-foreground py-8",
							children: "No commissions yet"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: data.commissions.slice(0, 5).map((commission, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-border/50 pb-3 last:border-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold capitalize",
									children: commission.type.replace(/_/g, " ")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: new Date(commission.created_at).toLocaleDateString()
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold text-gold",
											children: ["$", commission.amount.toLocaleString()]
										}),
										commission.shares_bonus > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"+ ",
												commission.shares_bonus,
												" shares"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-xs ${commission.status === "paid" ? "text-emerald-400" : "text-yellow-400"}`,
											children: commission.status
										})
									]
								})]
							}, idx))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold mb-4",
						children: "Commission Structure"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-background/60 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Direct Referral"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-2xl font-bold text-gold",
										children: "10% USDT"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "+ 5% in shares"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-background/60 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Top Monthly"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-2xl font-bold text-gold",
										children: "15%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Best performer"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-background/60 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Daily Pool"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-2xl font-bold text-gold",
										children: "5%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Performance based"
									})
								]
							})
						]
					})]
				})
			]
		})]
	});
}
function StatCard({ icon: Icon, label, value, subtext, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-2xl border p-6 ${highlight ? "border-gold/30 bg-gold/5" : "border-border bg-card"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-6 w-6" })
			}),
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
	});
}
//#endregion
export { AffiliatePage as component };
