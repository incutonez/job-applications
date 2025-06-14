import {
	type ApplicationViewModel,
	EnumApplicationStatus,
	EnumFeatures,
	EnumLocationTypes,
} from "@incutonez/life-stats-spec";
import MimeTypes from "mime-types";
import PapaParse from "papaparse";
import { v4 } from "uuid";
import { authUser } from "@/authentication.ts";
import { UserLanguage } from "@/constants.ts";
import type { IOption, IPluginPaste, TLabelAlign } from "@/types/components.ts";

export const getUniqueId = v4;
const CapitalizeWordBoundary = /(?=[A-Z])/;
const CSVFields = [
	"company",
	"positionTitle",
	"dateApplied",
	"url",
	"compensation",
	"comments",
	"status",
];
const dateFormatter = new Intl.DateTimeFormat(UserLanguage, {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat(UserLanguage, {
	hour: "numeric",
	minute: "2-digit",
	second: "2-digit",
});

export function toNumber(value: number, unit?: string) {
	let response = new Intl.NumberFormat(UserLanguage).format(value);
	if (unit) {
		response += ` ${unit}`;
	}
	return response;
}

export function toDate(value?: number | Date) {
	if (value === undefined || isNaN(value as number)) {
		return undefined;
	}
	return dateFormatter.format(value);
}

export function toTime(value?: number | Date) {
	if (value === undefined || isNaN(value as number)) {
		return undefined;
	}
	return timeFormatter.format(value);
}

export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(() => {
		resolve(true);
	}, ms));
}

export function getLabelAlign(align: TLabelAlign) {
	return align === "left" ? "field-label-left" : "field-label-top";
}

export function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function splitPascal(value: string) {
	return capitalize(value.split(CapitalizeWordBoundary).join(" "));
}

export function isObject(value: unknown) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}

export function isDefined(value: unknown) {
	return value !== null && value !== undefined;
}

export function enumToOptions<T extends object>(items: T) {
	const options: IOption[] = [];
	for (const key in items) {
		options.push({
			id: items[key] as string,
			display: splitPascal(key),
		});
	}
	return options;
}

export function getEnumDisplay(enums: Record<string, number | string>, value?: string | number) {
	if (value === undefined) {
		return "";
	}
	let found = "";
	for (const key in enums) {
		if (value === enums[key]) {
			found = key;
			break;
		}
	}
	return splitPascal(found);
}

export function getUserName(value: string) {
	return value === authUser.value?.sub ? authUser.value.name : value;
}

export function pasteToApplicationViewModel(value: string) {
	const { url = "",
		dateApplied = Date.now(),
		positionTitle = "",
		company = "",
		compensation = "" } = JSON.parse(value) as IPluginPaste;
	return {
		url,
		dateApplied,
		positionTitle,
		compensation,
		id: "",
		site: "",
		status: EnumApplicationStatus.Applied,
		locationType: EnumLocationTypes.Remote,
		userId: "",
		company: {
			id: getUniqueId(),
			name: company,
			userId: "",
		},
		comments: [],
	} as ApplicationViewModel;
}

export function makeCSV() {
	return PapaParse.unparse({
		data: [],
		fields: CSVFields,
	}, {
		delimiter: ";",
	});
}

export function downloadFile(blob: Blob, name = "download", extension = MimeTypes.extension(blob.type)) {
	if (!extension) {
		return;
	}
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.style.display = "none";
	a.href = url;
	// the filename you want
	a.download = `${name}.${extension}`;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
}

export function updateAppTitle(feature: EnumFeatures) {
	document.title = `Life Stats - ${capitalize(getEnumDisplay(EnumFeatures, feature))}`;
}
