import { prisma } from "../config/prisma";

interface AuditProfileParams {
	profileId: string;
	userId: string;
	action: string;
	oldValues?: any;
	newValues?: any;
	changedFields?: string[];
	note?: string;
	profileType?: string;
	syncSource?: string;
	villageId?: string | null;
}

function sanitizeAuditValues(values: any): any {
	if (!values || typeof values !== "object") return values;
	const sanitized = { ...values };
	if (sanitized.cccd) {
		sanitized.cccd = sanitized.cccd_last4
			? `***${sanitized.cccd_last4}`
			: "***";
	}
	return sanitized;
}

export async function auditProfile(
	{
		profileId,
		userId,
		action,
		oldValues,
		newValues,
		changedFields,
		note,
		profileType = "chuctho",
		syncSource = "online",
		villageId,
	}: AuditProfileParams,
	tx?: any,
) {
	try {
		const db = tx || prisma;
		await (db as any).profile_audit_log.create({
			data: {
				profile_id: profileId,
				user_id: userId,
				village_id: villageId || null,
				action,
				changed_fields: changedFields || [],
				old_values: sanitizeAuditValues(oldValues) || null,
				new_values: sanitizeAuditValues(newValues) || null,
				note: note || null,
				profile_type: profileType,
				sync_source: syncSource,
			},
		});
	} catch (error) {
		console.error("Failed to create audit log:", error);
	}
}

// Remove Vietnamese diacritics for search
export function removeAccents(str: string): string {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D");
}

export const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isValidUUID = (val: unknown): val is string =>
	typeof val === "string" && UUID_REGEX.test(val.trim());
