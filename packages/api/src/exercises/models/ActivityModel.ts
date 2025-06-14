import { DataTypes, NonAttribute } from "@sequelize/core";
import { Attribute, BelongsTo, HasMany, NotNull } from "@sequelize/core/decorators-legacy";
import { EnumTableNames, PoundToCalories } from "@/constants";
import { AttributeEnum, BaseTable, PrimaryKeyGuid } from "@/db/decorators";
import { BaseModel } from "@/db/models/BaseModel";
import { calculateCalories, EnumActivitySource } from "@/exercises/constants";
import {
	ActivityAttributeModel,
	IActivityAttributeCreate,
} from "@/exercises/models/ActivityAttributeModel";
import { ActivityTypeModel, IActivityTypeCreate } from "@/exercises/models/ActivityTypeModel";
import { ModelInterface } from "@/types";

export type IActivityModel = ModelInterface<ActivityModel>;

export type IActivityUpdateModel = Omit<IActivityModel, "attributes" | "activity_type" | "calories" | "weight_lost">;

export type IActivityCreate = Omit<IActivityModel, "id" | "activity_type" | "attributes" | "calories" | "weight_lost"> & {
	activity_type: IActivityTypeCreate;
	attributes: IActivityAttributeCreate[];
};

@BaseTable(EnumTableNames.exerciseActivities)
export class ActivityModel extends BaseModel {
	@PrimaryKeyGuid()
	declare id: string;

	@Attribute(DataTypes.STRING)
	declare title: string;

	@Attribute(DataTypes.DOUBLE)
	declare weight?: number;

	@Attribute(DataTypes.DOUBLE)
	declare duration?: number;

	@Attribute(DataTypes.STRING)
	declare description?: string;

	@AttributeEnum(EnumActivitySource)
	declare source?: EnumActivitySource;

	@Attribute(DataTypes.STRING)
	declare source_id?: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare activity_type_id: string;

	@Attribute(DataTypes.INTEGER)
	declare date_occurred: number;

	@HasMany(() => ActivityAttributeModel, {
		foreignKey: "activity_id",
		inverse: "activity",
	})
	declare attributes?: NonAttribute<ActivityAttributeModel[]>;

	@BelongsTo(() => ActivityTypeModel, {
		foreignKey: "activity_type_id",
	})
	declare activity_type: NonAttribute<ActivityTypeModel>;

	@Attribute(DataTypes.VIRTUAL(DataTypes.DOUBLE, ["duration", "activity_type_id", "weight"]))
	get calories(): NonAttribute<number | undefined> {
		const duration = this.get("duration");
		if (duration) {
			return calculateCalories(this.get("activity_type").name, duration, this.get("weight"));
		}
	}

	@Attribute(DataTypes.VIRTUAL(DataTypes.DOUBLE, ["calories"]))
	get weight_lost(): NonAttribute<number | undefined> {
		const calories = this.get("calories");
		if (calories) {
			return calories / PoundToCalories;
		}
	}
}
