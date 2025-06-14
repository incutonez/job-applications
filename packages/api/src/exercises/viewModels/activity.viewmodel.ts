import { EnumActivitySource } from "@/exercises/constants";
import {
	ActivityAttributeCreateViewModel,
	ActivityAttributeViewModel,
} from "@/exercises/viewModels/activity.attribute.viewmodel";
import {
	ActivityTypeCreateViewModel,
	ActivityTypeViewModel,
} from "@/exercises/viewModels/activity.type.viewmodel";
import { ModelInterface } from "@/types";
import { GetResponseModel } from "@/viewModels/base.list.viewmodel";
import { BaseViewModel } from "@/viewModels/BaseViewModel";
import { ApiEnum } from "@/viewModels/decorators";

export type IActivityViewModel = ModelInterface<ActivityViewModel>;

export type IActivityCreateViewModel = ModelInterface<ActivityCreateViewModel>;

export class ActivityCreateViewModel extends BaseViewModel {
	declare title: string;

	declare weight?: number;

	declare duration?: number;

	declare description?: string;

	@ApiEnum({
		EnumActivitySource,
	})
	declare source?: EnumActivitySource;

	declare sourceId?: string;

	declare dateOccurred: number;

	declare activityType: ActivityTypeCreateViewModel;

	declare attributes: ActivityAttributeCreateViewModel[];

	declare calories?: number;

	declare weightLost?: number;
}

export class ActivityViewModel extends ActivityCreateViewModel {
	declare id: string;

	declare activityType: ActivityTypeViewModel;

	declare attributes: ActivityAttributeViewModel[];
}

export class ActivityListViewModel extends GetResponseModel<ActivityViewModel>(ActivityViewModel) {}
