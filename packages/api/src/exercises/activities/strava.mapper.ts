import { Inject, Injectable } from "@nestjs/common";
import { SessionStorageService } from "@/auth/session.storage.service";
import { EnumUnitTypes, PoundToCalories, SecondsInHour, SESSION_STORAGE } from "@/constants";
import { ActivitiesMapper } from "@/exercises/activities/activities.mapper";
import { calculateCalories, EnumActivitySource } from "@/exercises/constants";
import { IStravaActivity, IStravaImport } from "@/exercises/types";
import { IActivityAttributeCreateViewModel } from "@/exercises/viewModels/activity.attribute.viewmodel";
import { IActivityCreateViewModel	 } from "@/exercises/viewModels/activity.viewmodel";
import { dateToUTC } from "@/utils";

@Injectable()
export class StravaMapper {
	constructor(@Inject(SESSION_STORAGE) private readonly storage: SessionStorageService, private readonly activitiesMapper: ActivitiesMapper) {
	}

	apiToViewModel(entity: IStravaActivity): IActivityCreateViewModel {
		const userId = this.storage.getUserId();
		const activityType = entity.type;
		const duration = entity.moving_time / SecondsInHour;
		const weight = this.storage.getUserSettings().exercises.weight ?? 200;
		const calories = calculateCalories(activityType, duration, weight);
		const attributes: (IActivityAttributeCreateViewModel | undefined)[] = [
			this.activitiesMapper.stubAttribute(entity.elapsed_time.toString(), "Duration Total", {
				unit: EnumUnitTypes.Seconds,
				unitConversion: EnumUnitTypes.Hours,
			}),
			this.activitiesMapper.stubAttribute(entity.distance.toString(), "Distance", {
				unit: EnumUnitTypes.Meters,
				unitConversion: EnumUnitTypes.Kilometers,
			}),
			this.activitiesMapper.stubAttribute(entity.max_speed.toString(), "Speed Max", {
				unit: EnumUnitTypes.MetersPerSecond,
				unitConversion: EnumUnitTypes.KilometersPerHour,
			}),
			this.activitiesMapper.stubAttribute(entity.average_speed.toString(), "Speed Average", {
				unit: EnumUnitTypes.MetersPerSecond,
				unitConversion: EnumUnitTypes.KilometersPerHour,
			}),
			this.activitiesMapper.stubAttribute(entity.elev_low?.toString(), "Elevation Low", {
				unit: EnumUnitTypes.Meters,
			}),
			this.activitiesMapper.stubAttribute(entity.elev_high?.toString(), "Elevation High", {
				unit: EnumUnitTypes.Meters,
			}),
			this.activitiesMapper.stubAttribute(entity.location_city as never, "Location City"),
			this.activitiesMapper.stubAttribute(entity.location_state as never, "Location State"),
			this.activitiesMapper.stubAttribute(entity.location_country, "Location Country"),
		];

		return {
			userId,
			weight,
			duration,
			calories,
			weightLost: calories ? calories / PoundToCalories : undefined,
			dateOccurred: new Date(entity.start_date).getTime(),
			source: EnumActivitySource.Strava,
			sourceId: entity.id.toString(),
			title: entity.name,
			activityType: {
				userId,
				name: activityType,
			},
			attributes: attributes.filter((value) => value !== undefined),
		};
	}

	importToViewModel(entity: IStravaImport): IActivityCreateViewModel {
		const userId = this.storage.getUserId();
		const activityType = entity["Activity Type"];
		const duration = parseFloat(entity["Moving Time"]) / SecondsInHour;
		const weight = this.storage.getUserSettings().exercises.weight ?? 200;
		const calories = calculateCalories(activityType, duration, weight);
		const attributes: (IActivityAttributeCreateViewModel | undefined)[] = [
			// Time should be stored in seconds
			this.activitiesMapper.stubAttribute(entity["Elapsed Time"], "Duration Total", {
				unit: EnumUnitTypes.Seconds,
				unitConversion: EnumUnitTypes.Hours,
			}),
			this.activitiesMapper.stubAttribute(entity["Distance"], "Distance", {
				unit: EnumUnitTypes.Kilometers,
			}),
			this.activitiesMapper.stubAttribute(entity["Max Speed"], "Speed Max", {
				unit: EnumUnitTypes.MetersPerSecond,
				unitConversion: EnumUnitTypes.KilometersPerHour,
			}),
			this.activitiesMapper.stubAttribute(entity["Average Speed"], "Speed Average", {
				unit: EnumUnitTypes.MetersPerSecond,
				unitConversion: EnumUnitTypes.KilometersPerHour,
			}),
			this.activitiesMapper.stubAttribute(entity["Elevation Low"], "Elevation Low", {
				unit: EnumUnitTypes.Meters,
			}),
			this.activitiesMapper.stubAttribute(entity["Elevation High"], "Elevation High", {
				unit: EnumUnitTypes.Meters,
			}),
		];

		return {
			userId,
			weight,
			duration,
			calories,
			weightLost: calories ? calories / PoundToCalories : undefined,
			source: EnumActivitySource.Strava,
			sourceId: entity["Activity ID"],
			dateOccurred: dateToUTC(entity["Activity Date"]),
			title: entity["Activity Name"],
			description: entity["Activity Description"],
			activityType: {
				userId,
				name: activityType,
			},
			attributes: attributes.filter((value) => value !== undefined),
		};
	}
}
