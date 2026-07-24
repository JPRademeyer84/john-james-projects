import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as CircleAlert, b as ArrowLeft, g as CircleCheckBig } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invest-BfC7hzoi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SHARE_PRICE = 10;
var MAX_SHARES_PER_PURCHASE = 1e4;
var OFFERING_END = /* @__PURE__ */ new Date("2026-08-18T23:59:59Z");
function InvestPage() {
	const [shares, setShares] = (0, import_react.useState)(100);
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("usdt");
	const [walletAddress, setWalletAddress] = (0, import_react.useState)("");
	const [proofFile, setProofFile] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [success, setSuccess] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const amount = shares * SHARE_PRICE;
	const isOfferingActive = Date.now() < OFFERING_END.getTime();
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			if (!proofFile) throw new Error("Payment proof is required");
			const formData = new FormData();
			formData.append("shares", shares.toString());
			formData.append("amount", amount.toString());
			formData.append("payment_method", paymentMethod);
			formData.append("wallet_address", walletAddress);
			formData.append("payment_proof", proofFile);
			if (!(await fetch("/api/invest/purchase", {
				method: "POST",
				headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
				body: formData
			})).ok) throw new Error("Investment failed");
			setSuccess(true);
			setShares(100);
			setWalletAddress("");
			setProofFile(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Investment failed");
		} finally {
			setLoading(false);
		}
	};
	if (!isOfferingActive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background text-foreground flex items-center justify-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-16 w-16 text-gold mx-auto" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-2xl font-bold",
					children: "Offering Closed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "The 30-day fractional share offering has ended."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard",
					className: "mt-6 inline-flex items-center gap-2 rounded-md border border-gold/50 px-6 py-3 font-semibold text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Dashboard"]
				})
			]
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
			className: "mx-auto max-w-4xl px-6 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-bold",
						children: "Purchase Shares"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: "Secure your fractional stake in John James Projects"
					})]
				}),
				success && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-5 w-5 text-emerald-400 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-emerald-400",
						children: "Investment Submitted"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-emerald-400/80 mt-1",
						children: "Your investment is pending approval. You will receive a confirmation email shortly."
					})] })]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-red-400",
						children: error
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						className: "lg:col-span-2 space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-semibold mb-6",
								children: "Investment Details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "block text-sm font-medium mb-2",
											children: "Number of Shares"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "1",
											max: MAX_SHARES_PER_PURCHASE,
											value: shares,
											onChange: (e) => setShares(Number(e.target.value)),
											className: "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												"Price per share: $",
												SHARE_PRICE,
												" USD"
											]
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-sm font-medium mb-2",
										children: "Payment Method"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: paymentMethod,
										onChange: (e) => setPaymentMethod(e.target.value),
										className: "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "usdt",
												children: "USDT (TRC20)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "usdt-erc20",
												children: "USDT (ERC20)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "btc",
												children: "Bitcoin"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "eth",
												children: "Ethereum"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-sm font-medium mb-2",
										children: "Your Wallet Address"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										value: walletAddress,
										onChange: (e) => setWalletAddress(e.target.value),
										className: "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground font-mono text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold",
										placeholder: "0x..."
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-sm font-medium mb-2",
										children: "Upload Payment Proof"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*,.pdf",
										onChange: (e) => setProofFile(e.target.files?.[0] || null),
										className: "w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
									})] })
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading || !proofFile,
							className: "w-full rounded-lg bg-gold-gradient px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
							children: loading ? "Processing..." : `Invest $${amount.toLocaleString()}`
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-gold/30 bg-gold/5 p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-semibold mb-4",
								children: "Order Summary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Shares"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: shares.toLocaleString()
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Price per share"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold",
											children: ["$", SHARE_PRICE]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "border-t border-border/50 pt-3 flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: "Total Amount"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-display text-xl font-bold text-gold",
											children: ["$", amount.toLocaleString()]
										})]
									})
								]
							})]
						})
					})]
				})
			]
		})]
	});
}
//#endregion
export { InvestPage as component };
