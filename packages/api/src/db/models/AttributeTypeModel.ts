import { DataTypes } from "@sequelize/core";
import { Attribute } from "@sequelize/core/decorators-legacy";
import { EnumFeatures, EnumTableNames } from "@/constants";
import { AttributeEnum, BaseTable, PrimaryKeyGuid } from "@/db/decorators";
import { BaseModel } from "@/db/models/BaseModel";
import { ModelInterface } from "@/types";

export type IAttributeType = ModelInterface<AttributeTypeModel>;

export type IAttributeTypeCreate = Omit<IAttributeType, "id">;

@BaseTable(EnumTableNames.attributeTypes)
export class AttributeTypeModel extends BaseModel {
	@PrimaryKeyGuid()
	declare id: string;

	@Attribute(DataTypes.STRING)
	declare name: string;

	@AttributeEnum(EnumFeatures)
	declare feature?: EnumFeatures;
}
