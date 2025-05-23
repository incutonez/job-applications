﻿import { Column, HasMany, Table } from "sequelize-typescript";
import { PrimaryKeyGuid } from "@/db/decorators";
import { ApplicationModel } from "@/db/models/ApplicationModel";
import { BaseModel } from "@/db/models/BaseModel";

@Table({
	tableName: "companies",
	createdAt: "created_at",
	updatedAt: "updated_at",
})
export class CompanyModel extends BaseModel {
    @PrimaryKeyGuid()
    declare id: string;

	@Column
	declare name: string;

    @HasMany(() => ApplicationModel, "company_id")
    declare applications?: ApplicationModel[];
}
