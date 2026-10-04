export interface Profile {
	id: string | number;
	stt?: number;
	village_id?: string | null;
	villageId?: string | number | null;
	name: string;
	dob: string;
	gender: string;
	cccd: string;
	ethnicity: string;
	residence: string;
	currentAddress: string;
	age60?: string;
	age65?: string;
	age70?: string;
	age75?: string;
	age80?: string;
	age85?: string;
	age90?: string;
	age95?: string;
	age100?: string;
	ageOver100?: string;
	received: boolean | number;
	notes?: string;
	_displayStatus?: string;
}

export type IPCResponse = {
	success: boolean;
	data?: any;
	error?: string;
	message?: string;
};

export interface HtxhProfile {
	id: string | number;
	stt?: number;
	village_id?: string | null;
	villageId?: string | number | null;
	name: string;
	dob: string;
	gender: string;
	cccd: string;
	ethnicity: string;
	residence: string;
	currentAddress: string;
	age75plus?: string;
	age70to74poor?: string;
	baoTro?: string;
	huuTri?: string;
	huuTuatBaoHiem?: string;
	nguoiCoCong?: string;
	received: boolean | number;
	notes?: string;
	_displayStatus?: string;
}

export type AuditLog = {
	id: string | number;
	action: string;
	changed_fields?: string;
	old_values?: string;
	new_values?: string;
	note?: string;
	created_at: string;
	username?: string;
};

export type SortKey =
	| "name"
	| "milestone"
	| "dob"
	| "stt"
	| "gender"
	| "cccd"
	| "residence"
	| "currentAddress"
	| "current_address"
	| "received"
	| null;
export type SortDirection = "asc" | "desc" | null;
export type TabType = "chuctho" | "htxh";
