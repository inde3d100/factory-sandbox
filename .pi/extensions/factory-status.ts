// Footer line that names who is working in the factory right now, read from factory/jobs/*/job.json.
// Example: "🏭 003 builder r1 · 004 reviewers code✓ ux… · 1 waits for you"
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const WHO: Record<string, (j: any) => string> = {
	intake: () => "intake",
	spec: () => "spec-writer",
	build: (j) => `builder r${j.round}`,
	gate: (j) => `checks r${j.round}`,
	review: (j) =>
		"reviewers " +
		Object.entries(j.reviews ?? {})
			.map(([r, v]) => `${r}${v === "PASS" ? "✓" : v === "CHANGES" ? "✗" : "…"}`)
			.join(" "),
	approve: () => "approver",
	merging: () => "merging",
};

export function factoryLine(jobs: any[]): string | undefined {
	const working = jobs.filter((j) => WHO[j.stage]).map((j) => `${j.id.slice(0, 3)} ${WHO[j.stage](j)}`);
	const waiting = jobs.filter((j) => j.stage === "needs-human" || j.stage === "needs-info").length;
	if (!working.length && !waiting) return undefined;
	return ["🏭 " + (working.join(" · ") || "idle"), waiting ? `${waiting} waits for you` : ""].filter(Boolean).join(" · ");
}

function readJobs(dir: string): any[] {
	try {
		return readdirSync(dir).flatMap((id) => {
			try {
				return [JSON.parse(readFileSync(join(dir, id, "job.json"), "utf8"))];
			} catch {
				return []; // a job folder being written, or not a job
			}
		});
	} catch {
		return []; // no factory/jobs yet
	}
}

export default function (pi: ExtensionAPI) {
	let timer: ReturnType<typeof setInterval> | undefined;
	pi.on("session_start", (_event, ctx) => {
		if (!ctx.hasUI) return;
		const dir = join(ctx.cwd, "factory", "jobs");
		let last: string | undefined;
		const tick = () => {
			const line = factoryLine(readJobs(dir));
			if (line !== last) ctx.ui.setStatus("factory", (last = line));
		};
		tick();
		timer = setInterval(tick, 2000);
		timer.unref?.();
	});
	pi.on("session_shutdown", () => {
		if (timer) clearInterval(timer);
		timer = undefined;
	});
}
