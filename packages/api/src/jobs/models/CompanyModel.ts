import { DataTypes, NonAttribute } from "@sequelize/core";
import { Attribute, HasMany } from "@sequelize/core/decorators-legacy";
import { EnumTableNames } from "@/constants";
import { BaseTable, PrimaryKeyGuid } from "@/db/decorators";
import { BaseModel } from "@/db/models/BaseModel";
import { ApplicationModel } from "@/jobs/models/ApplicationModel";

@BaseTable(EnumTableNames.jobCompanies)
export class CompanyModel extends BaseModel {
	@PrimaryKeyGuid()
	declare id: string;

	@Attribute(DataTypes.STRING)
	declare name: string;

	@HasMany(() => ApplicationModel, {
		foreignKey: "company_id",
		inverse: "company",
	})
	declare applications?: NonAttribute<ApplicationModel[]>;
}
