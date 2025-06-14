import { DataTypes, NonAttribute } from "@sequelize/core";
import { Attribute, BelongsTo, NotNull } from "@sequelize/core/decorators-legacy";
import { EnumTableNames, EnumUnitTypes } from "@/constants";
import { AttributeEnum, BaseTable, PrimaryKeyGuid } from "@/db/decorators";
import { AttributeTypeModel, IAttributeTypeCreate } from "@/db/models/AttributeTypeModel";
import { BaseModel } from "@/db/models/BaseModel";
import { ActivityModel } from "@/exercises/models/ActivityModel";
import { ModelInterface } from "@/types";

export type IActivityAttributeModel = ModelInterface<ActivityAttributeModel>;

export type IActivityAttributeCreate = Omit<IActivityAttributeModel, "id" | "attribute_type"> & {
	attribute_type: IAttributeTypeCreate;
};

@BaseTable(EnumTableNames.exerciseActivityAttributes)
export class ActivityAttributeModel extends BaseModel {
	@PrimaryKeyGuid()
	declare id: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare activity_id: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare attribute_type_id: string;

	@Attribute(DataTypes.STRING)
	declare value: string;

	@AttributeEnum(EnumUnitTypes)
	declare unit?: EnumUnitTypes;

	@AttributeEnum(EnumUnitTypes)
	declare unit_display?: EnumUnitTypes;

	@BelongsTo(() => ActivityModel, {
		foreignKey: "activity_id",
	})
	declare activity?: NonAttribute<ActivityModel>;

	@BelongsTo(() => AttributeTypeModel, {
		foreignKey: "attribute_type_id",
	})
	declare attribute_type: NonAttribute<AttributeTypeModel>;
}
