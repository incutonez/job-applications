import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { differenceInWeeks, endOfDay, isSunday, nextSunday } from "date-fns";
import { v4 as getUUID } from "uuid";
import { SessionStorageService } from "@/auth/session.storage.service";
import { SESSION_STORAGE } from "@/constants";
import { CommentsMapper } from "@/jobs/applications/comments.mapper";
import { IUploadApplicationModel } from "@/jobs/applications/types";
import { CompaniesMapper } from "@/jobs/companies/companies.mapper";
import { EnumApplicationStatus, EnumLinkType, EnumLocationTypes } from "@/jobs/constants";
import { ApplicationModel, IApplicationCreateModel, IApplicationUpdateModel } from "@/jobs/models/ApplicationModel";
import {
	IApplicationCreateViewModel, IApplicationLinkViewModel,
	IApplicationNestedViewModel,
	IApplicationUpdateViewModel,
	IApplicationViewModel,
} from "@/jobs/viewModels/application.viewmodel";

const DomainRegex = /https?:\/\/.*?([^./]+?\.[^.]+?(?:\.\w{2})?)(?:\/|$)/;

function getStatusFromApplied(status: EnumApplicationStatus, dateApplied: number) {
	let endOfWeekDate = endOfDay(Date.now());
	// We use Sunday as the end of the week, and that's the range we want to use for our difference check
	if (!isSunday(endOfWeekDate)) {
		endOfWeekDate = nextSunday(endOfWeekDate);
	}
	const difference = differenceInWeeks(endOfWeekDate, dateApplied);
	if (difference === 0 && status === EnumApplicationStatus.Applied) {
		// Either use the existing order that has been set or default it to be this week
		status = EnumApplicationStatus.CurrentWeek;
	}
	return status;
}

@Injectable()
export class ApplicationsMapper implements OnModuleInit {
	declare private companiesMapper: CompaniesMapper;

	constructor(private readonly moduleRef: ModuleRef, private commentsMapper: CommentsMapper, @Inject(SESSION_STORAGE) private authStorageService: SessionStorageService) {
	}

	onModuleInit() {
		this.companiesMapper = this.moduleRef.get(CompaniesMapper, {
			strict: false,
		});
	}

	urlToSite(url: string) {
		let site = "";
		if (url.toLowerCase().includes("linkedin")) {
			site = "LinkedIn";
		}
		else if (url.includes("indeed")) {
			site = "Indeed";
		}
		else if (url.includes("reddit")) {
			site = "Reddit";
		}
		else if (url.includes("vuejobs")) {
			site = "VueJobs";
		}
		else {
			site = url.match(DomainRegex)?.[1]?.replace(/\..*/, "") ?? "";
			if (site) {
				site = site[0].toUpperCase() + site.substring(1);
			}
		}
		return site;
	}

	/**
	 * There are times (like when we do GET applicationId), where we want to use the actual status and not the altered one
	 * we use in the list, which is why we have the rawStatus param
	 */
	entityToViewModel({ id, updated_at, linked = [], links = [], location_type, created_at, user_id, company, position_title, date_applied, url, compensation, status, comments }: ApplicationModel, rawStatus = false): IApplicationViewModel {
		return {
			id,
			url,
			compensation,
			locationType: location_type,
			status: rawStatus ? status : getStatusFromApplied(status, date_applied),
			userId: user_id,
			site: this.urlToSite(url),
			positionTitle: position_title,
			dateCreated: created_at!.getTime(),
			dateUpdated: updated_at!.getTime(),
			dateApplied: date_applied,
			company: this.companiesMapper.entityToViewModel(company),
			comments: comments.map((comment) => this.commentsMapper.entityToViewModel(comment)) ?? [],
			links: [...linked.map((linkedItem) => this.entityLinkedToViewModel(linkedItem, EnumLinkType.To)), ...links.map((linkedItem) => this.entityLinkedToViewModel(linkedItem, EnumLinkType.From))],
		};
	}

	entityLinkedToViewModel({ id, position_title, status }: ApplicationModel, type: EnumLinkType): IApplicationLinkViewModel {
		return {
			id,
			status,
			type,
			positionTitle: position_title,
		};
	}

	entityNestedToViewModel({ id, location_type, updated_at, user_id, created_at, position_title, date_applied, url, compensation, status, comments }: ApplicationModel): IApplicationNestedViewModel {
		return {
			id,
			url,
			compensation,
			locationType: location_type,
			status: getStatusFromApplied(status, date_applied),
			userId: user_id,
			site: this.urlToSite(url),
			positionTitle: position_title,
			dateCreated: created_at!.getTime(),
			dateUpdated: updated_at!.getTime(),
			dateApplied: date_applied,
			comments: comments.map((comment) => this.commentsMapper.entityToViewModel(comment)) ?? [],
		};
	}

	csvModelToViewModel({ company, comments, url = "", compensation, positionTitle, status, dateApplied }: IUploadApplicationModel): IApplicationCreateViewModel {
		const userId = this.authStorageService.getUserId();
		return {
			url,
			compensation,
			positionTitle,
			userId,
			locationType: EnumLocationTypes.Remote,
			comments: comments ? comments.split(/\r\n|\n|\r/g).map((comment) => {
				return {
					userId,
					comment,
					id: getUUID(),
					applicationId: "",
				};
			}) : [],
			dateApplied: new Date(dateApplied).getTime(),
			status: parseInt(status, 10) as EnumApplicationStatus,
			company: {
				userId,
				id: getUUID(),
				name: company,
			},
		};
	}

	viewModelToEntity({ id, compensation, userId, company, status, url, positionTitle, dateApplied, locationType }: IApplicationUpdateViewModel): IApplicationUpdateModel {
		return {
			id,
			compensation,
			status,
			url,
			location_type: locationType,
			user_id: userId ?? this.authStorageService.getUserId(),
			position_title: positionTitle,
			date_applied: dateApplied,
			company_id: company.id,
			updated_at: new Date(),
		};
	}

	createViewModelToEntity({ compensation, locationType, company, status, url, positionTitle, dateApplied }: IApplicationCreateViewModel, useAppliedDate = false): IApplicationCreateModel {
		return {
			compensation,
			status,
			url,
			location_type: locationType,
			user_id: this.authStorageService.getUserId(),
			created_at: useAppliedDate ? new Date(dateApplied) : undefined,
			position_title: positionTitle,
			date_applied: dateApplied,
			company_id: company.id,
		};
	}
}
