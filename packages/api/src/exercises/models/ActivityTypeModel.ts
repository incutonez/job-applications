import { DataTypes, NonAttribute } from "@sequelize/core";
import { Attribute, HasMany } from "@sequelize/core/decorators-legacy";
import { EnumTableNames } from "@/constants";
import { BaseTable, PrimaryKeyGuid } from "@/db/decorators";
import { BaseModel } from "@/db/models/BaseModel";
import { ActivityModel } from "@/exercises/models/ActivityModel";
import { ModelInterface } from "@/types";

export type IActivityTypeModel = ModelInterface<ActivityTypeModel>;

export type IActivityTypeCreate = Omit<IActivityTypeModel, "id">;

@BaseTable(EnumTableNames.exerciseActivityTypes)
export class ActivityTypeModel extends BaseModel {
	@PrimaryKeyGuid()
	declare id: string;

	@Attribute(DataTypes.STRING)
	declare name: string;

	@HasMany(() => ActivityModel, {
		foreignKey: "activity_type_id",
		inverse: "activity",
	})
	declare activities?: NonAttribute<ActivityModel[]>;
}
