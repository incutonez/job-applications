import { DataTypes, Model } from "@sequelize/core";
import { Attribute } from "@sequelize/core/decorators-legacy";
import { EnumAuditActionTypes, EnumFeatures, EnumTableNames } from "@/constants";
import { AttributeEnum, BaseTable, PrimaryKeyGuid } from "@/db/decorators";
import { ModelInterface } from "@/types";

export type IAuditModel = ModelInterface<AuditModel>;

@BaseTable({
	tableName: EnumTableNames.audits,
	updatedAt: false,
})
export class AuditModel extends Model {
	@PrimaryKeyGuid()
	declare id: string;

	@Attribute(DataTypes.STRING)
	declare user_id: string;

	@AttributeEnum(EnumTableNames)
	declare entity: EnumTableNames;

	@Attribute(DataTypes.STRING)
	declare entity_id: string;

	@AttributeEnum(EnumFeatures)
	declare feature: EnumFeatures;

	@Attribute(DataTypes.ENUM(Object.values(EnumAuditActionTypes)))
	declare action: EnumAuditActionTypes;

	@Attribute(DataTypes.STRING)
	declare value_current?: string;

	@Attribute(DataTypes.STRING)
	declare value_previous?: string;

	@Attribute(DataTypes.DATE)
	declare created_at: Date;
}
