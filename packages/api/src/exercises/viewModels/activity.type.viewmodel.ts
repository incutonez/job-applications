import { ActivityViewModel } from "@/exercises/viewModels/activity.viewmodel";
import { ModelInterface } from "@/types";
import { BaseViewModel } from "@/viewModels/BaseViewModel";

export type IActivityTypeViewModel = ModelInterface<ActivityTypeViewModel>;

export type IActivityTypeCreateViewModel = ModelInterface<ActivityTypeCreateViewModel>;

export class ActivityTypeCreateViewModel extends BaseViewModel {
	declare name: string;
}

export class ActivityTypeViewModel extends ActivityTypeCreateViewModel {
	declare id: string;

	activities?: ActivityViewModel[];
}
