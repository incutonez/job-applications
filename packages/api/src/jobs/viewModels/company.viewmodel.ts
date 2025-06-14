import { ApplicationNestedViewModel } from "@/jobs/viewModels/application.viewmodel";
import { GetResponseModel } from "@/viewModels/base.list.viewmodel";
import { BaseViewModel } from "@/viewModels/BaseViewModel";

export class CompanyCreateViewModel extends BaseViewModel {
	declare name: string;
}

export class CompanyViewModel extends CompanyCreateViewModel {
	declare id: string;
}

export class CompanyFullViewModel extends CompanyViewModel {
	declare applications: ApplicationNestedViewModel[];
}

export class CompanyListViewModel extends GetResponseModel<CompanyViewModel>(CompanyViewModel) {}

export class CompanyFullListViewModel extends GetResponseModel<CompanyFullViewModel>(CompanyFullViewModel) {}
