import { Inject, Injectable } from "@nestjs/common";
import { AttributeTypesMapper } from "@/attributeTypes/attributeTypes.mapper";
import { SessionStorageService } from "@/auth/session.storage.service";
import { EnumFeatures, SESSION_STORAGE } from "@/constants";
import { EnumActivitySource } from "@/exercises/constants";
import {
	IActivityAttributeCreate,
	IActivityAttributeModel,
} from "@/exercises/models/ActivityAttributeModel";
import {
	IActivityCreate,
	IActivityModel,
	IActivityUpdateModel,
} from "@/exercises/models/ActivityModel";
import { IActivityTypeCreate, IActivityTypeModel } from "@/exercises/models/ActivityTypeModel";
import { IStubAttributeOptions } from "@/exercises/types";
import { IActivityAttributeCreateViewModel, IActivityAttributeViewModel } from "@/exercises/viewModels/activity.attribute.viewmodel";
import {
	IActivityTypeCreateViewModel,
	IActivityTypeViewModel,
} from "@/exercises/viewModels/activity.type.viewmodel";
import { IActivityCreateViewModel,	IActivityViewModel } from "@/exercises/viewModels/activity.viewmodel";
import { addMetaInfo, convertToUnit, localizeValue } from "@/utils";

@Injectable()
export class ActivitiesMapper {
	constructor(@Inject(SESSION_STORAGE) private readonly storage: SessionStorageService, private readonly attributeTypesMapper: AttributeTypesMapper) {
	}

	stubAttribute(value: string | undefined, field: string, { unit, unitConversion }: IStubAttributeOptions = {}): IActivityAttributeCreateViewModel | undefined {
		if (value) {
			const userId = this.storage.getUserId();
			const convertedValue = convertToUnit({
				value,
				unit,
				unitTo: unitConversion,
			});
			return this.entityActivityAttributeToViewModel({
				activity_id: "",
				attribute_type_id: "",
				id: "",
				value: convertedValue.value,
				unit: convertedValue.unit,
				user_id: userId,
				attribute_type: {
					id: "",
					user_id: userId,
					name: field,
					feature: EnumFeatures.exercises,
				},
			});
		}
		return undefined;
	}

	entityToViewModel({ id, user_id, calories, weight_lost, duration, weight, source_id, title, activity_type, created_at, updated_at, attributes = [], source, description, date_occurred }: IActivityModel, addMeta = true): IActivityViewModel {
		const response = {
			id,
			source,
			description,
			title,
			weight,
			duration,
			calories,
			weightLost: weight_lost,
			sourceId: source_id,
			activityType: this.entityActivityTypeToViewModel(activity_type),
			attributes: attributes.map((attribute) => this.entityActivityAttributeToViewModel(attribute)),
			dateOccurred: date_occurred,
		};
		if (addMeta) {
			addMetaInfo(response, user_id, created_at, updated_at);
		}
		return response;
	}

	entityActivityAttributeToViewModel({ id, attribute_type, activity, unit_display, user_id, created_at, updated_at, value, unit }: IActivityAttributeModel, addMeta = false) {
		const localizedValue = localizeValue({
			value,
			unit,
			measurementSystem: this.storage.getMeasurementSystem(),
		});
		const response: IActivityAttributeViewModel = {
			id,
			value: localizedValue.value,
			unit: localizedValue.unit,
			activity: activity && this.entityToViewModel(activity),
			attributeType: this.attributeTypesMapper.entityToViewModel(attribute_type),
		};
		if (unit_display) {
			const convertedValue = convertToUnit({
				value,
				unit,
				unitTo: unit_display,
			});
			response.unitDisplay = convertedValue.unit;
			response.valueDisplay = convertedValue.value;
		}
		if (addMeta) {
			addMetaInfo(response, user_id, created_at, updated_at);
		}
		return response;
	}

	entityActivityTypeToViewModel({ id, activities, user_id, name, created_at, updated_at }: IActivityTypeModel, addMeta = false): IActivityTypeViewModel {
		const response = {
			id,
			name,
			activities: activities?.map((activity) => this.entityToViewModel(activity)),
		};
		if (addMeta) {
			addMetaInfo(response, user_id, created_at, updated_at);
		}
		return response;
	}

	viewModelCreateActivityTypeToEntity({ name, userId }: IActivityTypeCreateViewModel): IActivityTypeCreate {
		return {
			name,
			user_id: userId ?? this.storage.getUserId(),
		};
	}

	viewModelActivityTypeToEntity({ id, name, userId }: IActivityTypeViewModel): IActivityTypeModel {
		return {
			id,
			name,
			user_id: userId ?? this.storage.getUserId(),
		};
	}

	viewModelCreateActivityAttributesToEntity({ value, unit, unitDisplay, userId, attributeType }: IActivityAttributeCreateViewModel): IActivityAttributeCreate {
		const result = localizeValue({
			value,
			unit,
			reverse: true,
			measurementSystem: this.storage.getMeasurementSystem(),
		});
		return {
			unit: result.unit,
			value: result.value,
			// Appease TS... we'll be setting this when we have the value from the DB entry
			activity_id: "",
			// Appease TS... we'll be setting this when we have the value from the DB entry
			attribute_type_id: "",
			unit_display: unitDisplay,
			user_id: userId ?? this.storage.getUserId(),
			attribute_type: this.attributeTypesMapper.viewModelCreateToEntity(attributeType),
		};
	}

	viewModelActivityAttributeToEntity({ id, value, unit, unitDisplay, activity, userId, attributeType }: IActivityAttributeViewModel, activityId = activity?.id): IActivityAttributeModel {
		const result = localizeValue({
			value,
			unit,
			reverse: true,
			measurementSystem: this.storage.getMeasurementSystem(),
		});
		return {
			id,
			unit: result.unit,
			value: result.value,
			activity_id: activityId!,
			attribute_type_id: attributeType.id,
			unit_display: unitDisplay,
			user_id: userId ?? this.storage.getUserId(),
			attribute_type: this.attributeTypesMapper.viewModelToEntity(attributeType),
		};
	}

	viewModelCreateToEntity({ userId, weight = this.storage.getUserSettings().exercises.weight, duration, source = EnumActivitySource.None, sourceId, activityType, attributes, description, title, dateOccurred }: IActivityCreateViewModel): IActivityCreate {
		const defaultUserId = this.storage.getUserId();
		sourceId = source === EnumActivitySource.None ? "" : sourceId;
		return {
			source,
			title,
			description,
			weight,
			duration,
			source_id: sourceId,
			// Appease TS... we'll be setting this when we have the value from the DB entry
			activity_type_id: "",
			user_id: userId ?? defaultUserId,
			date_occurred: dateOccurred,
			activity_type: this.viewModelCreateActivityTypeToEntity(activityType),
			attributes: attributes.map((attribute) => this.viewModelCreateActivityAttributesToEntity(attribute)),
		};
	}

	viewModelToEntity({ id, userId, duration, weight = this.storage.getUserSettings().exercises.weight, source = EnumActivitySource.None, sourceId, activityType, description, title, dateOccurred }: IActivityViewModel): IActivityUpdateModel {
		const defaultUserId = this.storage.getUserId();
		sourceId = source === EnumActivitySource.None ? "" : sourceId;
		return {
			id,
			source,
			title,
			description,
			weight,
			duration,
			source_id: sourceId,
			activity_type_id: activityType.id,
			user_id: userId ?? defaultUserId,
			date_occurred: dateOccurred,
		};
	}
}
