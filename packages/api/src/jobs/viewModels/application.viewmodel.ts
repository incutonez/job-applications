import { OmitType } from "@nestjs/swagger";
import { EnumApplicationStatus, EnumLinkType, EnumLocationTypes } from "@/jobs/constants";
import { CommentViewModel } from "@/jobs/viewModels/comment.viewmodel";
import { CompanyViewModel } from "@/jobs/viewModels/company.viewmodel";
import { ModelInterface } from "@/types";
import { GetResponseModel } from "@/viewModels/base.list.viewmodel";
import { BaseViewModel } from "@/viewModels/BaseViewModel";
import { ApiEnum } from "@/viewModels/decorators";

export type IApplicationViewModel = ModelInterface<ApplicationViewModel>;

export type IApplicationUpdateViewModel = Omit<IApplicationViewModel, "site">;

export type IApplicationCreateViewModel = ModelInterface<ApplicationCreateViewModel>;

export type IApplicationNestedViewModel = Omit<IApplicationViewModel, "company">;

export type IApplicationLinkViewModel = ModelInterface<ApplicationLinkViewModel>;

export class ApplicationCreateViewModel extends BaseViewModel {
	declare positionTitle: string;

	declare dateApplied: number;

	declare url: string;

	declare compensation: string;

	@ApiEnum({
		EnumApplicationStatus,
	})
	declare status: EnumApplicationStatus;

	@ApiEnum({
		EnumLocationTypes,
	})
	declare locationType: EnumLocationTypes;

	declare company: CompanyViewModel;

	declare comments: CommentViewModel[];

	declare links?: ApplicationLinkViewModel[];
}

export class ApplicationViewModel extends ApplicationCreateViewModel {
	declare id: string;

	declare site: string;
}

export class ApplicationLinkViewModel extends BaseViewModel {
	declare id: string;

	declare positionTitle?: string;

	@ApiEnum({
		EnumApplicationStatus,
	})
	declare status?: EnumApplicationStatus;

	@ApiEnum({
		EnumLinkType,
	})
	declare type: EnumLinkType;
}

export class ApplicationNestedViewModel extends OmitType(ApplicationViewModel, ["company"]) {}

export class ApplicationListViewModel extends GetResponseModel<ApplicationViewModel>(ApplicationViewModel) {}
