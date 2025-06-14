import { SetMetadata, UsePipes, ValidationPipe } from "@nestjs/common";
import { Unit } from "convert";

export const SESSION_STORAGE = "USER_STORAGE";
export const DataBaseStoragePath = "src/db/data.db";
export const EncryptionAlgorithm = "aes-256-cbc";
export const SEQUELIZE = "SEQUELIZE";
export const CreatedAtField = "created_at";
export const UpdatedAtField = "updated_at";
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const EnumAuditActionTypes = {
	created: "Created",
	updated: "Updated",
	deleted: "Deleted",
} as const;
export type EnumAuditActionTypes = typeof EnumAuditActionTypes[keyof typeof EnumAuditActionTypes];

export const EnumFeatures = {
	jobs: 1,
	exercises: 2,
	system: 3,
} as const;
export type EnumFeatures = typeof EnumFeatures[keyof typeof EnumFeatures];

export const EnumTableNames = {
	audits: 1,
	exerciseActivities: 2,
	exerciseActivityTypes: 3,
	exerciseActivityAttributes: 4,
	attributeTypes: 5,
	jobApplications: 6,
	jobCompanies: 7,
	jobComments: 8,
	unitTypes: 9,
	users: 10,
} as const;
export type EnumTableNames = typeof EnumTableNames[keyof typeof EnumTableNames];

export const EnumUnitTypes = {
	Inches: 1,
	Feet: 2,
	Miles: 3,
	Centimeters: 4,
	Meters: 5,
	Kilometers: 6,
	Milliseconds: 7,
	Seconds: 8,
	Minutes: 9,
	Hours: 10,
	MetersPerSecond: 11,
	KilometersPerHour: 12,
	MilesPerHour: 13,
	FeetPerSecond: 14,
	String: 15,
	Number: 16,
	Boolean: 17,
	Date: 18,
} as const;
export type EnumUnitTypesKeys = keyof typeof EnumUnitTypes;
export type EnumUnitTypes = typeof EnumUnitTypes[EnumUnitTypesKeys];

/**
 * This maps to our conversion library's set of units
 */
export const EnumMappedUnitTypes: Record<Exclude<EnumUnitTypesKeys, "String"| "Number" | "Boolean" | "Date">, Unit> = {
	Inches: "inches",
	Feet: "feet",
	Miles: "miles",
	Centimeters: "centimeters",
	Meters: "meters",
	Kilometers: "kilometers",
	Milliseconds: "milliseconds",
	Seconds: "seconds",
	Minutes: "minutes",
	Hours: "hours",
	MetersPerSecond: "meters",
	KilometersPerHour: "kilometers",
	MilesPerHour: "miles",
	FeetPerSecond: "feet",
} as const;
export type EnumMappedUnitTypes = typeof EnumMappedUnitTypes[keyof typeof EnumMappedUnitTypes];

export const SecondsInHour = 60 * 60;

/**
 * According to https://www.mindful.sodexo.com/the-magic-formula-for-weight-loss/, if you burn or cut ~3500 calories,
 * you would lose 1 lb.
 */
export const PoundToCalories = 3500;

export function UseValidationPipe() {
	return UsePipes(new ValidationPipe({
		transform: true,
	}));
}

export function getTableName(tableValue: EnumTableNames) {
	for (const key in EnumTableNames) {
		if (EnumTableNames[key as keyof typeof EnumTableNames] === tableValue) {
			return key;
		}
	}
}
