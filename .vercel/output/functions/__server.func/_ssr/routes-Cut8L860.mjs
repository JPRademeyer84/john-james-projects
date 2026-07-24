import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as ShieldCheck, c as Info, d as Droplet, h as Clock, i as TrendingUp, l as Flame, m as Coins, n as Users, o as Mountain, r as Trophy, s as Lock, t as Zap, u as Factory, v as Calculator, y as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cut8L860.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var OFFERING_END = (/* @__PURE__ */ new Date("2026-08-18T23:59:59Z")).getTime();
function useCountdown(target) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setNow(Date.now()), 1e3);
		return () => clearInterval(id);
	}, []);
	const diff = Math.max(0, target - now);
	return {
		days: Math.floor(diff / 864e5),
		hours: Math.floor(diff / 36e5 % 24),
		minutes: Math.floor(diff / 6e4 % 60),
		seconds: Math.floor(diff / 1e3 % 60)
	};
}
function CountdownTimer({ compact = false }) {
	const { days, hours, minutes, seconds } = useCountdown(OFFERING_END);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `grid grid-cols-4 gap-2 ${compact ? "max-w-md" : "max-w-xl"}`,
		children: [
			{
				label: "Days",
				value: days
			},
			{
				label: "Hours",
				value: hours
			},
			{
				label: "Minutes",
				value: minutes
			},
			{
				label: "Seconds",
				value: seconds
			}
		].map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-gold/30 bg-gold/5 px-3 py-4 text-center backdrop-blur hover-lift sheen",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `font-display font-bold text-gold tabular-nums ${compact ? "text-2xl" : "text-4xl md:text-5xl"}`,
				children: String(u.value).padStart(2, "0")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[10px] uppercase tracking-widest text-muted-foreground",
				children: u.label
			})]
		}, u.label))
	});
}
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground font-body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MineSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferingSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividendSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioCharts, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividendCalculator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AffiliateSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisclaimerSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CTASection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function Header() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-9 w-9 place-items-center rounded-md bg-gold-gradient text-primary-foreground font-display font-bold shadow-[var(--shadow-gold)]",
						children: "JJ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold tracking-tight text-gold",
						children: "John James Projects"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden gap-8 md:flex",
					children: [
						"Mine",
						"Offering",
						"Dividends",
						"Affiliate",
						"Contact"
					].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `#${l.toLowerCase()}`,
						className: "text-sm text-muted-foreground transition-colors hover:text-gold",
						children: l
					}, l))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#offering",
					className: "rounded-md border border-gold px-4 py-2 text-sm font-semibold text-gold transition-all hover:bg-gold-gradient hover:text-primary-foreground hover:border-transparent sheen",
					children: "Invest Now"
				})
			]
		})
	});
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative overflow-hidden ore-grain",
		style: { backgroundImage: "var(--gradient-hero)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-gold/20 blur-[120px] ore-drift" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full blur-[120px] ore-drift",
				style: {
					animationDelay: "-6s",
					background: "color-mix(in oklab, var(--gold-deep) 35%, transparent)"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2 md:py-32",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "reveal-up",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold ring-1 ring-gold/30",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-3.5 w-3.5 animate-pulse" }), " 30 Days Only"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl",
							children: ["Own a Piece of", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-shimmer",
								children: "John James Projects."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-6 max-w-lg text-lg text-muted-foreground",
							children: [
								"A limited fractional share offering — 500,000 shares at just",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground font-semibold",
									children: "$10 each"
								}),
								". Backed by a rewarding USDT affiliate program."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#offering",
								className: "inline-flex items-center gap-2 rounded-md bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 glow-gold sheen",
								children: ["Reserve Your Shares ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#affiliate",
								className: "inline-flex items-center gap-2 rounded-md border border-gold/50 px-6 py-3 font-semibold text-gold transition-colors hover:bg-gold/10 sheen",
								children: "Affiliate Plan"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-3 text-xs font-semibold uppercase tracking-widest text-gold",
								children: "Offering Closes In"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownTimer, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									value: "$10",
									label: "Per Share"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									value: "500k",
									label: "Shares Available"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									value: "30",
									label: "Days Only"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative reveal-up",
					style: { animationDelay: "120ms" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 rounded-3xl bg-gold/15 blur-3xl ore-drift" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-gold/20 bg-surface/70 p-8 backdrop-blur hover-lift",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs uppercase tracking-widest text-muted-foreground",
									children: "Offering Snapshot"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 text-xs text-gold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative h-2 w-2 rounded-full bg-gold pulse-dot" }), " Live"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 space-y-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotRow, {
										label: "Total Raise",
										value: "$5,000,000"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotRow, {
										label: "Cost Price",
										value: "$50 / share",
										muted: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotRow, {
										label: "Selling Price",
										value: "$10 / share",
										highlight: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotRow, {
										label: "Fractional Shares",
										value: "500,000"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotRow, {
										label: "Window",
										value: "30 Days"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 rounded-xl bg-gold/10 p-5 ring-1 ring-gold/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-gold",
									children: "5× fractional split — a $50 share made accessible at $10 through fractional ownership."
								})
							})
						]
					})]
				})]
			})
		]
	});
}
function Stat({ value, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "font-display text-3xl font-bold text-gold",
		children: value
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 text-xs uppercase tracking-wider text-muted-foreground",
		children: label
	})] });
}
function SnapshotRow({ label, value, highlight, muted }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between border-b border-border/50 pb-3 last:border-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-display text-xl font-semibold ${highlight ? "text-gold" : muted ? "text-muted-foreground line-through" : "text-foreground"}`,
			children: value
		})]
	});
}
function OfferingSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "offering",
		className: "border-y border-border bg-surface/40 py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-2xl text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-widest text-gold",
						children: "The Offering"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-display text-4xl font-bold md:text-5xl",
						children: "The Math Is Simple."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-muted-foreground",
						children: "A transparent, fixed-window offering built for accessibility and clarity."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 grid gap-6 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferingCard, {
						step: "01",
						title: "Cost Price",
						equation: "100,000 × $50",
						result: "$5,000,000",
						note: "Original share valuation forming the underlying pool."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferingCard, {
						step: "02",
						title: "Fractional Split",
						equation: "$5,000,000 ÷ $10",
						result: "500,000 Shares",
						note: "Every share fractionalised so anyone can participate.",
						highlight: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferingCard, {
						step: "03",
						title: "Selling Window",
						equation: "Limited Access",
						result: "30 Days Only",
						note: "One offering. One window. No extensions."
					})
				]
			})]
		})
	});
}
function OfferingCard({ step, title, equation, result, note, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `group relative overflow-hidden rounded-2xl border p-8 hover-lift sheen ${highlight ? "border-gold/60 bg-gold/5 shadow-[var(--shadow-gold)]" : "border-border bg-card"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-sm font-bold text-gold",
					children: step
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5 text-muted-foreground" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 font-display text-2xl font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 text-sm text-muted-foreground",
				children: equation
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 font-display text-3xl font-bold text-gold",
				children: result
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: note
			})
		]
	});
}
function AffiliateSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "affiliate",
		className: "py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-16 md:grid-cols-[1fr,1.2fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-widest text-gold",
						children: "Affiliate Compensation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-4 font-display text-4xl font-bold md:text-5xl",
						children: ["Get Rewarded for", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-gold",
							children: "Growing the Network."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-muted-foreground",
						children: "A three-tier compensation model paid in USDT and shares. Built to reward referral, consistency and top performance."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-foreground",
							children: [
								"All commissions paid in ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-gold",
									children: "USDT"
								}),
								" ",
								"with additional bonus in fractional shares."
							]
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AffiliateCard, {
							icon: Users,
							tag: "First Level",
							title: "Direct Referral",
							percent: "10%",
							subPercent: "+ 5%",
							description: "10% in USDT plus 5% in share purchases on every first-level referral."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AffiliateCard, {
							icon: Trophy,
							tag: "Monthly",
							title: "Top Affiliate Bonus",
							percent: "15%",
							description: "Awarded monthly to the top-performing affiliate across the network."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AffiliateCard, {
							icon: TrendingUp,
							tag: "Daily",
							title: "Performance Pool",
							percent: "5%",
							description: "A daily performance pool distributed to qualifying affiliates."
						})
					]
				})]
			})
		})
	});
}
function AffiliateCard({ icon: Icon, tag, title, percent, subPercent, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 hover-lift sheen hover:border-gold/50 hover:bg-gold/5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)] transition-transform group-hover:scale-110",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground",
						children: tag
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl font-semibold",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: description
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-4xl font-bold text-shimmer",
					children: percent
				}), subPercent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs font-semibold text-gold-soft",
					children: [subPercent, " Shares"]
				})]
			})
		]
	});
}
function CTASection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "contact",
		className: "border-t border-border bg-surface/40 py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-4xl px-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase tracking-widest text-gold",
					children: "Limited Window"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mt-4 font-display text-4xl font-bold md:text-6xl",
					children: ["30 Days. 500,000 Shares.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-gold",
						children: "One Opportunity."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-6 max-w-xl text-muted-foreground",
					children: "Secure your fractional stake in John James Projects before the window closes."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownTimer, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex flex-wrap justify-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "mailto:invest@johnjamesprojects.com",
						className: "inline-flex items-center gap-2 rounded-md bg-gold-gradient px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 glow-gold sheen",
						children: ["Reserve Shares ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "mailto:affiliate@johnjamesprojects.com",
						className: "inline-flex items-center gap-2 rounded-md border border-gold/50 px-8 py-4 font-semibold text-gold transition-colors hover:bg-gold/10 sheen",
						children: "Join Affiliate Program"
					})]
				})
			]
		})
	});
}
function MineSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "mine",
		className: "relative border-t border-border py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-16 md:grid-cols-[1fr,1.4fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-widest text-gold",
						children: "The Purpose"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-4 font-display text-4xl font-bold md:text-5xl",
						children: ["Funding the Aureus Alliance", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-gold",
							children: "Holdings Mine — Kadoma."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-muted-foreground",
						children: "Capital raised through this offering funds the running expenses of the Aureus Alliance Holdings gold mine in Kadoma, Zimbabwe. The site is fully secured, staffed and equipped — the capital unlocks daily production."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-muted-foreground",
						children: [
							"The goal: five additional plants operational by ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold font-semibold",
								children: "December 2026"
							}),
							", expanding output to 10 plants running in parallel."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Established Backing"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-display text-xl text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold",
								children: "John James Property Development"
							}), " — founded 1971, funding Zimbabwean mining projects since 2016."]
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						{
							icon: Mountain,
							title: "Secured Land",
							desc: "Fully permitted mining ground in Kadoma, Zimbabwe."
						},
						{
							icon: ShieldCheck,
							title: "On-Site Security",
							desc: "24/7 protection for staff, plant and gold recovery."
						},
						{
							icon: Factory,
							title: "100 t/h Wash Plant",
							desc: "Operational plant capable of yielding 1kg of gold per day."
						},
						{
							icon: Droplet,
							title: "5 Boreholes",
							desc: "Independent water supply already installed and tested."
						},
						{
							icon: Users,
							title: "Trained Workforce",
							desc: "Full operations team on the ground and ready to run."
						},
						{
							icon: Zap,
							title: "Power Needed",
							desc: "Capital raised funds generators & diesel for 10 hrs/day."
						}
					].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover-lift sheen hover:border-gold/50 hover:bg-gold/5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-12 w-12 place-items-center rounded-xl bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)] transition-transform group-hover:rotate-6 group-hover:scale-110",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(a.icon, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-5 font-display text-lg font-semibold",
								children: a.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: a.desc
							})
						]
					}, a.title))
				})]
			})
		})
	});
}
function DividendSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "dividends",
		className: "border-y border-border bg-surface/40 py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-2xl text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-widest text-gold",
						children: "Dividend Illustration"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-display text-4xl font-bold md:text-5xl",
						children: "How the Numbers Flow."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-muted-foreground",
						children: [
							"A ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "projection"
							}),
							" based on 10 plants at full production. Actual output and returns may be higher or lower depending on gold recovery grades, gold spot price, plant uptime, diesel and energy costs, regulatory factors and the pace of expansion."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 grid gap-8 lg:grid-cols-[1.3fr,1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-semibold",
							children: "Annual Production Model"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 divide-y divide-border/60",
						children: [
							{
								label: "Gold per day (per plant, projected)",
								value: "~1 kg"
							},
							{
								label: "Operating days per month",
								value: "22.4"
							},
							{
								label: "Plants at full scale",
								value: "10"
							},
							{
								label: "Projected monthly output",
								value: "~224 kg"
							},
							{
								label: "Projected annual output (× 12)",
								value: "~2,688 kg"
							},
							{
								label: "Gold price (per kg, indicative)",
								value: "$130,000"
							},
							{
								label: "Projected gross annual revenue",
								value: "~$349,440,000"
							},
							{
								label: "Less 50% (opex, tax, refinery)",
								value: "−$174,720,000",
								muted: true
							},
							{
								label: "Projected distributable profit",
								value: "~$174,720,000",
								highlight: true
							},
							{
								label: "Total shares issued",
								value: "1,400,000"
							},
							{
								label: "Projected dividend per full share / yr",
								value: "~$124.80",
								highlight: true
							}
						].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: r.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-display text-lg font-semibold tabular-nums ${r.highlight ? "text-gold" : r.muted ? "text-muted-foreground" : "text-foreground"}`,
								children: r.value
							})]
						}, r.label))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-gold/40 bg-gold/5 p-8 shadow-[var(--shadow-gold)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold uppercase tracking-widest text-gold",
								children: "John James Allocation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 space-y-3 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									"100,000 shares × ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground font-semibold",
										children: "~$124.80"
									}),
									" ≈",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground font-semibold",
										children: "~$12,480,000"
									}),
									" in projected annual dividends."
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Fractionalised across 500,000 shares at $10 each:" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 rounded-xl bg-background/40 p-6 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Projected Per Fractional Share / Year"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 font-display text-5xl font-bold text-shimmer tabular-nums",
										children: "~$24.96"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 text-xs text-muted-foreground",
										children: "Projection only — may be more or lower; grows as new mines are acquired."
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-semibold",
								children: "12-Month Lock-Up"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: [
								"Each share purchased is locked for 12 months. First dividend distribution begins ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gold font-semibold",
									children: "July 2027"
								}),
								"."
							]
						})]
					})]
				})]
			})]
		})
	});
}
var SCENARIOS = [
	{
		key: "conservative",
		name: "Conservative",
		tagline: "Lower recovery, softer gold price, slower rollout",
		kgPerDay: .7,
		pricePerKg: 11e4,
		plants: 8,
		tone: "conservative"
	},
	{
		key: "base",
		name: "Base Case",
		tagline: "Target model — 10 plants at design capacity",
		kgPerDay: 1,
		pricePerKg: 13e4,
		plants: 10,
		tone: "base"
	},
	{
		key: "optimistic",
		name: "Optimistic",
		tagline: "Higher grade, stronger spot price, full 10-plant fleet",
		kgPerDay: 1.2,
		pricePerKg: 15e4,
		plants: 10,
		tone: "optimistic"
	}
];
var DAYS_PER_MONTH = 22.4;
var MONTHS = 12;
var OPEX_RATIO = .5;
var JJ_SHARES = 1e5;
var TOTAL_SHARES = 14e5;
var FRACTIONAL_SHARES = 5e5;
function computeScenario(s) {
	const annualKg = s.kgPerDay * DAYS_PER_MONTH * MONTHS * s.plants;
	const grossRevenue = annualKg * s.pricePerKg;
	const distributable = grossRevenue * (1 - OPEX_RATIO);
	const jjDividend = distributable * (JJ_SHARES / TOTAL_SHARES);
	const perFractional = jjDividend / FRACTIONAL_SHARES;
	return {
		annualKg,
		grossRevenue,
		distributable,
		jjDividend,
		perFractional,
		yieldPct: perFractional / 10 * 100
	};
}
function fmtUsd(n, digits = 0) {
	return `$${n.toLocaleString(void 0, {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	})}`;
}
function ScenarioSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "scenarios",
		className: "py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-2xl text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold uppercase tracking-widest text-gold",
							children: "Scenario Projections"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 font-display text-4xl font-bold md:text-5xl",
							children: "Higher, Lower — What the Range Looks Like."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground",
							children: "Dividends move with gold recovered per day, the spot price of gold and how many plants are online. These three scenarios show what a fractional share could earn per year across a conservative, base and optimistic outlook."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-16 grid gap-6 md:grid-cols-3",
					children: SCENARIOS.map((s) => {
						const r = computeScenario(s);
						const isBase = s.tone === "base";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `relative flex flex-col rounded-2xl border p-8 hover-lift sheen ${isBase ? "border-gold/50 bg-gold/5 shadow-[var(--shadow-gold)]" : "border-border bg-card"}`,
							children: [
								isBase && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-3 left-8 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background",
									children: "Target"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-xl font-semibold",
										children: s.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[10px] font-semibold uppercase tracking-widest ${s.tone === "optimistic" ? "text-emerald-400" : s.tone === "conservative" ? "text-muted-foreground" : "text-gold"}`,
										children: s.tone
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: s.tagline
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-6 space-y-2 border-t border-border/60 pt-4 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Gold / day / plant",
											value: `${s.kgPerDay} kg`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Plants online",
											value: `${s.plants}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Gold price / kg",
											value: fmtUsd(s.pricePerKg)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Annual output",
											value: `~${Math.round(r.annualKg).toLocaleString()} kg`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Gross revenue",
											value: `~${fmtUsd(r.grossRevenue)}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											label: "Distributable (50%)",
											value: `~${fmtUsd(r.distributable)}`
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `mt-6 rounded-xl p-5 text-center ${isBase ? "bg-background/40" : "bg-surface/60"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] uppercase tracking-widest text-muted-foreground",
											children: "Projected / Fractional Share / Yr"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1 font-display text-4xl font-bold text-gold tabular-nums",
											children: ["~$", r.perFractional.toFixed(2)]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												"≈ ",
												r.yieldPct.toFixed(1),
												"% annual yield on $10 cost"
											]
										})
									]
								})
							]
						}, s.key);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground",
					children: "All figures are projections, not guarantees. Actual results depend on gold grade and recovery, spot price, plant uptime, diesel and energy costs, regulatory conditions and the pace at which additional plants and mines come online. Returns may be higher or lower than shown."
				})
			]
		})
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-display font-semibold tabular-nums text-foreground",
			children: value
		})]
	});
}
function DisclaimerSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-4xl px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-border bg-card/60 p-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold/10 ring-1 ring-gold/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-5 w-5 text-gold" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-semibold text-foreground",
						children: "Important — Nature of the Shares"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm leading-relaxed text-muted-foreground",
						children: [
							"Aureus Alliance Holdings shares are ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "not a security"
							}),
							" and",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "not an investment product"
							}),
							". You are purchasing a share in the holdings company and are therefore entitled to dividends drawn from the profits of the operation. Ownership is generational — passing to you, your children, and potentially theirs. As the company expands and acquires additional mines, dividends are expected to grow beyond the illustrative",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold font-semibold",
								children: " $24.96"
							}),
							" per fractional share figure shown above."
						]
					})] })]
				})
			})
		})
	});
}
function ScenarioCharts() {
	const rows = SCENARIOS.map((s) => ({
		s,
		r: computeScenario(s)
	}));
	const metrics = [
		{
			key: "annualKg",
			label: "Annual Gold Output",
			unit: "kg",
			fmt: (v) => `${Math.round(v).toLocaleString()} kg`
		},
		{
			key: "grossRevenue",
			label: "Gross Revenue",
			unit: "USD",
			fmt: (v) => fmtUsd(v)
		},
		{
			key: "perFractional",
			label: "Dividend / Fractional Share / Yr",
			unit: "USD",
			fmt: (v) => `$${v.toFixed(2)}`
		}
	];
	const toneColor = (t) => t === "optimistic" ? "bg-emerald-400/80" : t === "conservative" ? "bg-muted-foreground/60" : "bg-gold";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "charts",
		className: "py-24 bg-surface/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-2xl text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold uppercase tracking-widest text-gold",
							children: "Visual Comparison"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 font-display text-4xl font-bold md:text-5xl",
							children: "Scenarios Side by Side."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground",
							children: "The same three outlooks — conservative, base and optimistic — plotted across the metrics that matter most to a fractional shareholder."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-14 grid gap-6 md:grid-cols-3",
					children: metrics.map((m) => {
						const values = rows.map((r) => r.r[m.key]);
						const max = Math.max(...values);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-widest text-muted-foreground",
									children: m.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 font-display text-sm text-foreground/80",
									children: "per year"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 space-y-5",
									children: rows.map(({ s, r }) => {
										const v = r[m.key];
										const pct = max > 0 ? v / max * 100 : 0;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold uppercase tracking-widest text-muted-foreground",
												children: s.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display text-sm font-semibold tabular-nums text-foreground",
												children: m.fmt(v)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 h-3 overflow-hidden rounded-full bg-background/70 ring-1 ring-border",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `h-full ${toneColor(s.tone)} transition-all duration-700`,
												style: { width: `${pct}%` }
											})
										})] }, s.key);
									})
								})
							]
						}, m.key);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground",
					children: "Bars are scaled to the largest value in each chart. Projections only — actual outcomes depend on gold grade, recovery, spot price, uptime and rollout pace."
				})
			]
		})
	});
}
function DividendCalculator() {
	const [kgPerDay, setKgPerDay] = (0, import_react.useState)(1);
	const [pricePerKg, setPricePerKg] = (0, import_react.useState)(13e4);
	const [daysPerMonth, setDaysPerMonth] = (0, import_react.useState)(22);
	const [plants, setPlants] = (0, import_react.useState)(10);
	const compute = (kgFactor, priceFactor) => {
		const annualKg = kgPerDay * kgFactor * daysPerMonth * MONTHS * plants;
		const grossRevenue = annualKg * pricePerKg * priceFactor;
		const distributable = grossRevenue * (1 - OPEX_RATIO);
		const perFractional = distributable * (JJ_SHARES / TOTAL_SHARES) / FRACTIONAL_SHARES;
		return {
			annualKg,
			grossRevenue,
			distributable,
			perFractional,
			yieldPct: perFractional / 10 * 100
		};
	};
	const conservative = compute(.8, .9);
	const base = compute(1, 1);
	const optimistic = compute(1.15, 1.1);
	const cards = [
		{
			name: "Conservative",
			tone: "conservative",
			r: conservative,
			note: "kg × 0.80  ·  price × 0.90"
		},
		{
			name: "Base Case",
			tone: "base",
			r: base,
			note: "your inputs, as entered"
		},
		{
			name: "Optimistic",
			tone: "optimistic",
			r: optimistic,
			note: "kg × 1.15  ·  price × 1.10"
		}
	];
	const toneRing = (t) => t === "optimistic" ? "border-emerald-400/40 bg-emerald-400/5" : t === "conservative" ? "border-border bg-card" : "border-gold/50 bg-gold/5 shadow-[var(--shadow-gold)]";
	const toneText = (t) => t === "optimistic" ? "text-emerald-400" : t === "conservative" ? "text-muted-foreground" : "text-gold";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "calculator",
		className: "py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-2xl text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold uppercase tracking-widest text-gold",
							children: "Interactive Model"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 font-display text-4xl font-bold md:text-5xl",
							children: "Build Your Own Projection."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground",
							children: "Adjust gold per day, gold price, plant uptime and number of plants. The conservative, base and optimistic dividend estimates update live."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-14 grid gap-8 lg:grid-cols-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-2 rounded-2xl border border-border bg-card p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg font-semibold",
									children: "Inputs"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 space-y-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										label: "Gold / day / plant",
										value: kgPerDay,
										min: .3,
										max: 1.5,
										step: .05,
										onChange: setKgPerDay,
										display: `${kgPerDay.toFixed(2)} kg`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										label: "Gold price",
										value: pricePerKg,
										min: 8e4,
										max: 18e4,
										step: 1e3,
										onChange: setPricePerKg,
										display: `${fmtUsd(pricePerKg)} / kg`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										label: "Operating days / month",
										value: daysPerMonth,
										min: 10,
										max: 30,
										step: 1,
										onChange: setDaysPerMonth,
										display: `${daysPerMonth} days`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										label: "Plants online",
										value: plants,
										min: 1,
										max: 15,
										step: 1,
										onChange: setPlants,
										display: `${plants} plant${plants === 1 ? "" : "s"}`
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setKgPerDay(1);
									setPricePerKg(13e4);
									setDaysPerMonth(22);
									setPlants(10);
								},
								className: "mt-8 w-full rounded-lg border border-border bg-background/60 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-gold hover:border-gold/40 transition",
								children: "Reset to Base Case"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-3 space-y-4",
						children: cards.map((c) => {
							const maxPer = Math.max(conservative.perFractional, base.perFractional, optimistic.perFractional);
							const pct = maxPer > 0 ? c.r.perFractional / maxPer * 100 : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `rounded-2xl border p-6 ${toneRing(c.tone)}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `text-[10px] font-semibold uppercase tracking-widest ${toneText(c.tone)}`,
											children: c.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 text-xs text-muted-foreground",
											children: c.note
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-display text-3xl font-bold text-gold tabular-nums",
												children: ["$", c.r.perFractional.toFixed(2)]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] uppercase tracking-widest text-muted-foreground",
												children: [
													"per share / yr · ",
													c.r.yieldPct.toFixed(1),
													"% yield"
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 h-2 overflow-hidden rounded-full bg-background/70 ring-1 ring-border",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `h-full transition-all duration-500 ${c.tone === "optimistic" ? "bg-emerald-400/80" : c.tone === "conservative" ? "bg-muted-foreground/60" : "bg-gold"}`,
											style: { width: `${pct}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 grid grid-cols-3 gap-3 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "Annual kg",
												value: `${Math.round(c.r.annualKg).toLocaleString()}`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "Gross rev.",
												value: fmtUsd(c.r.grossRevenue)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "Distributable",
												value: fmtUsd(c.r.distributable)
											})
										]
									})
								]
							}, c.name);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground",
					children: [
						"Illustrative model. 50% of gross revenue is reserved for operating costs, tax and refinery. John James Projects holds ",
						JJ_SHARES.toLocaleString(),
						" of",
						" ",
						TOTAL_SHARES.toLocaleString(),
						" total Aureus Alliance Holdings shares, distributed across ",
						FRACTIONAL_SHARES.toLocaleString(),
						" fractional shares."
					]
				})
			]
		})
	});
}
function Slider({ label, value, min, max, step, onChange, display }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-sm font-semibold tabular-nums text-gold",
			children: display
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "range",
		min,
		max,
		step,
		value,
		onChange: (e) => onChange(Number(e.target.value)),
		className: "mt-3 w-full accent-[var(--gold)]"
	})] });
}
function MiniStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-background/50 p-3 ring-1 ring-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[9px] uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-display text-sm font-semibold tabular-nums text-foreground truncate",
			children: value
		})]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-8 w-8 place-items-center rounded-md bg-gold text-primary-foreground font-display text-sm font-bold",
					children: "JJ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display font-semibold text-gold",
					children: "John James Projects"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" John James Projects. All rights reserved."
				]
			})]
		})
	});
}
//#endregion
export { Index as component };
