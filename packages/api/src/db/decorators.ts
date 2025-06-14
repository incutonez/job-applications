import { DataTypes } from "@sequelize/core";
import { Attribute, Table } from "@sequelize/core/decorators-legacy";
import { uuid } from "uuidv4";
import { CreatedAtField, EnumTableNames, getTableName, UpdatedAtField } from "@/constants";

export function PrimaryKeyGuid() {
	return Attribute({
		type: DataTypes.UUID,
		defaultValue: () => uuid(),
		primaryKey: true,
		allowNull: false,
	});
}

export interface IBaseTable {
	tableName: EnumTableNames;
	createdAt?: typeof CreatedAtField | false;
	updatedAt?: typeof UpdatedAtField | false;
}

export function BaseTable(options: EnumTableNames | IBaseTable) {
	if (typeof options === "number") {
		options = {
			tableName: options,
		};
	}
	const { tableName, createdAt = CreatedAtField, updatedAt = UpdatedAtField } = options;
	return Table({
		tableName: getTableName(tableName),
		createdAt,
		updatedAt,
	});
}

/**
 * The normal validator for enums relies on the key being a string, but sometimes we have keys being numbers, and
 * that's what this decorator solves... adds validation to make sure the values contain the value
 */
export function AttributeEnum<T extends Record<string, number>>(values: T) {
	return Attribute({
		type: DataTypes.INTEGER,
		validate: {
			validator(value: T[keyof T]) {
				if (!(value === 0 || !!value) && !Object.values(values).includes(value)) {
					throw new Error("value not in EnumUnitTypes");
				}
			},
		},
	});
}
