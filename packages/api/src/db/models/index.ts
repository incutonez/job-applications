import { CreatedAtField, EnumAuditActionTypes, EnumFeatures, EnumTableNames, UpdatedAtField } from "@/constants";
import { AttributeTypeModel } from "@/db/models/AttributeTypeModel";
import { AuditModel } from "@/db/models/AuditModel";
import { BaseModel } from "@/db/models/BaseModel";
import { UserModel } from "@/db/models/UserModel";
import { ExerciseModels } from "@/exercises/models";
import { JobModels } from "@/jobs/models";
import { isObject } from "@/utils";

export interface IAuditFeatures {
	models: typeof BaseModel[];
	feature: EnumFeatures;
	primaryKey?: string;
}

export const SystemModels = [UserModel, AttributeTypeModel];
export const AuditedFeatures: IAuditFeatures[] = [{
	models: JobModels,
	feature: EnumFeatures.jobs,
}, {
	models: ExerciseModels,
	feature: EnumFeatures.exercises,
}, {
	models: SystemModels,
	feature: EnumFeatures.system,
}];
export const AllModels = [...JobModels, ...ExerciseModels, ...SystemModels, AuditModel];

function sanitizeDataType(value: any) {
	if (Array.isArray(value)) {
		value.forEach((item) => sanitizeDataType(item));
	}
	else if (isObject(value)) {
		sanitizeData(value);
	}
}

function sanitizeData(data: Record<string, unknown>) {
	for (const key in data) {
		sanitizeDataType(data[key]);
	}
	delete data[CreatedAtField];
	delete data[UpdatedAtField];
	return data;
}

function getChanges(instance: BaseModel) {
	const changed = instance.changed();
	let valueCurrent: Record<string, unknown> = {};
	let valuePrevious: Record<string, unknown> = {};
	if (changed) {
		for (const field of changed) {
			if (field === UpdatedAtField) {
				continue;
			}
			valueCurrent[field] = instance.getDataValue(field);
			valuePrevious[field] = instance.previous(field);
		}
	}
	else {
		valuePrevious = sanitizeData(instance.previous());
		valueCurrent = sanitizeData(instance.getPlain());
	}

	return {
		value_current: Object.keys(valueCurrent).length ? JSON.stringify(valueCurrent, null, 2) : "",
		value_previous: Object.keys(valuePrevious).length ? JSON.stringify(valuePrevious, null, 2) : "",
	};
}

export function addAuditing() {
	AuditedFeatures.forEach(({ models, feature, primaryKey = "id" }) => {
		models.forEach((model) => {
			const table_name = model.modelDefinition.table.tableName;
			const entity = EnumTableNames[table_name as keyof typeof EnumTableNames];
			model.hooks.addListeners({
				async afterCreate(instance: BaseModel, { transaction }) {
					const { value_current } = getChanges(instance);
					await AuditModel.create({
						value_current,
						feature,
						entity,
						entity_id: instance.get(primaryKey),
						user_id: instance.user_id,
						action: EnumAuditActionTypes.created,
					}, {
						transaction,
					});
				},
				async afterUpdate(instance: BaseModel, { transaction }) {
					const { value_previous, value_current } = getChanges(instance);
					// Only add an update if we have a non-empty object
					if (value_current) {
						await AuditModel.create({
							value_previous,
							value_current,
							feature,
							entity,
							entity_id: instance.get(primaryKey),
							user_id: instance.user_id,
							action: EnumAuditActionTypes.updated,
						}, {
							transaction,
						});
					}
				},
				async afterDestroy(instance: BaseModel, { transaction }) {
					const { value_current } = getChanges(instance);
					await AuditModel.create({
						table_name,
						feature,
						entity,
						entity_id: instance.get(primaryKey),
						value_previous: value_current,
						user_id: instance.user_id,
						action: EnumAuditActionTypes.deleted,
					}, {
						transaction,
					});
				},
			});
		});
	});
}
