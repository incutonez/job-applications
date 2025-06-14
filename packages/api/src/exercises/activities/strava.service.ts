import { env } from "node:process";
import { Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import Papa from "papaparse";
import { SessionStorageService } from "@/auth/session.storage.service";
import { SESSION_STORAGE } from "@/constants";
import { ActivitiesService } from "@/exercises/activities/activities.service";
import { StravaMapper } from "@/exercises/activities/strava.mapper";
import { EnumActivitySource } from "@/exercises/constants";
import { ActivityModel } from "@/exercises/models/ActivityModel";
import { IStravaActivity, IStravaAuthResponse, IStravaImport } from "@/exercises/types";
import {
	ActivityCreateViewModel,
	IActivityCreateViewModel,
} from "@/exercises/viewModels/activity.viewmodel";
import { StravaTokenViewModel } from "@/exercises/viewModels/strava.token.viewmodel";
import { IUploadViewModelsResponse } from "@/types";
import { getErrorMessage } from "@/utils";

const PerPage = 200;

@Injectable()
export class StravaService {
	constructor(private readonly activitiesService: ActivitiesService, private readonly mapper: StravaMapper, @Inject(SESSION_STORAGE) private readonly storage: SessionStorageService) {
	}

	async getUserAccessToken({ expirationDate = 0, refreshToken = "", accessToken }: StravaTokenViewModel): Promise<StravaTokenViewModel | undefined> {
		if (expirationDate >= Date.now()) {
			return {
				expirationDate,
				refreshToken,
				accessToken,
			};
		}
		const refresh = expirationDate !== 0;
		const params: Record<string, string> = {
			client_id: env.VITE_STRAVA_CLIENT_ID!,
			client_secret: env.VITE_STRAVA_CLIENT_SECRET!,
			grant_type: refresh ? "refresh_token" : "authorization_code",
		};
		if (refresh) {
			params.refresh_token = refreshToken;
		}
		else {
			params.code = accessToken;
		}
		const { data } = await axios<IStravaAuthResponse>({
			params,
			url: "https://www.strava.com/oauth/token",
			method: "POST",
		});
		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expirationDate: data.expires_at,
		};
	}

	importActivities(file: Express.Multer.File, source: EnumActivitySource) {
		const contents = file.buffer.toString("utf8");
		const results: IActivityCreateViewModel[] = [];
		if (source === EnumActivitySource.Strava) {
			const { data } = Papa.parse<IStravaImport>(contents, {
				header: true,
				skipEmptyLines: true,
			});
			for (const item of data) {
				results.push(this.mapper.importToViewModel(item));
			}
		}
		return results;
	}

	async uploadActivities(viewModels: ActivityCreateViewModel[]) {
		const results: IUploadViewModelsResponse = {
			successful: 0,
			errors: [],
		};
		for (const viewModel of viewModels) {
			try {
				await this.activitiesService.createActivity(viewModel);
				results.successful++;
			}
			catch (error: unknown) {
				results.errors.push(getErrorMessage(error));
			}
		}
		return results;
	}

	async getActivitiesRaw(accessToken: string, page = 1, after?: number) {
		const { data } = await axios<IStravaActivity[]>({
			// https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
			url: "https://www.strava.com/api/v3/athlete/activities",
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			params: {
				page,
				after,
				per_page: PerPage,
			},
		});
		return data;
	}

	async syncActivities(stravaToken: StravaTokenViewModel): Promise<StravaTokenViewModel | undefined> {
		// Let's find the user's latest strava activity, so we have a starting point for filtering out records from Strava
		const lastActivity = await ActivityModel.findOne({
			where: {
				source: EnumActivitySource.Strava,
				user_id: this.storage.getUserId(),
			},
			order: [["date_occurred", "DESC"]],
		});
		const response = await this.getUserAccessToken(stravaToken);
		if (response) {
			let page = 1;
			const allRecords: IActivityCreateViewModel[] = [];
			let hasMoreRecord = true;
			/**
			 * The API just says "epoch timestamp" but this must be in seconds...
			 * Source: https://groups.google.com/g/strava-api/c/uh0gZAa0dJw
			 */
			const afterTimestamp = lastActivity && lastActivity.date_occurred / 1000 || undefined;
			while (hasMoreRecord) {
				const data = await this.getActivitiesRaw(response.accessToken, page++, afterTimestamp);
				allRecords.push(...data.map((item) => this.mapper.apiToViewModel(item)));
				// If we're less than the page limit, then we know we've hit the end of the records, so we'll break
				hasMoreRecord = data.length >= PerPage;
			}
			for (const record of allRecords) {
				await this.activitiesService.createActivity(record);
			}
		}
		return response;
	}
}
