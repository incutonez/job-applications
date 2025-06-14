import { EnumUnitTypes } from "@/constants";
import {
	ActivityCreateViewModel,
	ActivityViewModel,
} from "@/exercises/viewModels/activity.viewmodel";
import { ModelInterface } from "@/types";
import { AttributeTypeCreateViewModel, AttributeTypeViewModel } from "@/viewModels/attribute.type.viewmodel";
import { BaseViewModel } from "@/viewModels/BaseViewModel";
import { ApiEnum } from "@/viewModels/decorators";

export type IActivityAttributeViewModel = ModelInterface<ActivityAttributeViewModel>;

export type IActivityAttributeCreateViewModel = ModelInterface<ActivityAttributeCreateViewModel>;

export class ActivityAttributeCreateViewModel extends BaseViewModel {
	declare value: string;

	@ApiEnum({
		EnumUnitTypes,
	})
	declare unit?: EnumUnitTypes;

	@ApiEnum({
		EnumUnitTypes,
	})
	declare unitDisplay?: EnumUnitTypes;

	declare valueDisplay?: string;

	declare activity?: ActivityCreateViewModel;

	declare attributeType: AttributeTypeCreateViewModel;
}

export class ActivityAttributeViewModel extends ActivityAttributeCreateViewModel {
	declare id: string;

	declare activity?: ActivityViewModel;

	declare attributeType: AttributeTypeViewModel;
}
