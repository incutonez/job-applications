import { DataTypes } from "@sequelize/core";
import { Attribute, NotNull } from "@sequelize/core/decorators-legacy";
import { EnumTableNames } from "@/constants";
import { BaseTable, PrimaryKeyGuid } from "@/db/decorators";
import { BaseModel } from "@/db/models/BaseModel";
import { ModelInterface } from "@/types";

export type ICommentModel = ModelInterface<CommentModel>;

export type ICommentCreateModel = Omit<ICommentModel, "id">;

@BaseTable(EnumTableNames.jobComments)
export class CommentModel extends BaseModel {
	@PrimaryKeyGuid()
	declare id: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare application_id: string;

	@Attribute(DataTypes.STRING)
	declare comment: string;
}
