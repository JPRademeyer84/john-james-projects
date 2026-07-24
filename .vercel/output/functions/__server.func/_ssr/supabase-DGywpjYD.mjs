import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-DGywpjYD.js
var supabase = createClient("https://fgubaqoftdeefcakejwu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndWJhcW9mdGRlZWZjYWtland1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDkyMTAsImV4cCI6MjA2Njg4NTIxMH0.ZdCtKWveoWqxufQ59OXGf2EXoCBjUhWe8spDvYASySI");
var auth = {
	async signIn(email, password) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		if (error) throw error;
		await ensureUserEnrolled(data.user.id);
		return data;
	},
	async signUp(email, password, username, sponsorCode) {
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password
		});
		if (authError) throw authError;
		if (!authData.user) throw new Error("User creation failed");
		let sponsorId = null;
		if (sponsorCode) {
			const { data: sponsor } = await supabase.from("users").select("id").eq("referral_code", sponsorCode).single();
			sponsorId = sponsor?.id;
		}
		const { error: userError } = await supabase.from("users").insert({
			id: authData.user.id,
			email,
			username,
			sponsor_id: sponsorId,
			referral_code: await generateReferralCode()
		});
		if (userError) throw userError;
		await enrollUserInProjects(authData.user.id);
		return authData;
	},
	async signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	},
	async getCurrentUser() {
		const { data: { user } } = await supabase.auth.getUser();
		return user;
	}
};
async function ensureUserEnrolled(userId) {
	const { data: enrollment } = await supabase.from("user_projects").select("*").eq("user_id", userId).eq("project_id", 2).maybeSingle();
	if (!enrollment) await supabase.from("user_projects").insert({
		user_id: userId,
		project_id: 2,
		status: "active",
		enrollment_source: "auto"
	});
	await supabase.from("user_projects").update({ last_accessed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", userId).eq("project_id", 2);
}
async function enrollUserInProjects(userId) {
	await supabase.from("user_projects").insert([{
		user_id: userId,
		project_id: 1,
		status: "active",
		enrollment_source: "auto"
	}, {
		user_id: userId,
		project_id: 2,
		status: "active",
		enrollment_source: "auto"
	}]);
}
async function generateReferralCode() {
	const code = `JJ${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
	const { data: existing } = await supabase.from("users").select("id").eq("referral_code", code).maybeSingle();
	if (existing) return generateReferralCode();
	return code;
}
//#endregion
export { auth as t };
