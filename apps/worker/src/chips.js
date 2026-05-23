import { CHIP_GROUPS } from "@sovereign/core";
export async function handleChips(req, _env) {
    const url = new URL(req.url);
    const mode = (url.searchParams.get("mode") || "self");
    const groups = CHIP_GROUPS[mode] ?? CHIP_GROUPS.self;
    const payload = {
        mode,
        groups
    };
    return Response.json(payload, {
        headers: { "cache-control": "public, max-age=300" }
    });
}
//# sourceMappingURL=chips.js.map