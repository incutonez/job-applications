import { Inject, Injectable } from "@nestjs/common";
import Papa from "papaparse";
import { SessionStorageService } from "@/auth/session.storage.service";
import { SESSION_STORAGE } from "@/constants";
import { ApplicationsMapper } from "@/jobs/applications/applications.mapper";
import { CommentsMapper } from "@/jobs/applications/comments.mapper";
import { IUploadApplicationModel } from "@/jobs/applications/types";
import { CompaniesService } from "@/jobs/companies/companies.service";
import { EnumApplicationStatus, EnumLinkType } from "@/jobs/constants";
import { ApplicationModel } from "@/jobs/models/ApplicationModel";
import { CommentModel } from "@/jobs/models/CommentModel";
import {
	ApplicationCreateViewModel,
	ApplicationListViewModel, ApplicationViewModel,
	IApplicationCreateViewModel,
} from "@/jobs/viewModels/application.viewmodel";
import { ICommentViewModel } from "@/jobs/viewModels/comment.viewmodel";
import { IUploadViewModelsResponse } from "@/types";
import { getErrorMessage } from "@/utils";
import { ApiPaginatedRequest } from "@/viewModels/base.list.viewmodel";

const CSVFields = [
	"company",
	"positionTitle",
	"dateApplied",
	"url",
	"compensation",
	"comments",
	"status",
];

@Injectable()
export class ApplicationsService {
	constructor(private mapper: ApplicationsMapper, private commentsMapper: CommentsMapper, private companiesService: CompaniesService, @Inject(SESSION_STORAGE) private authStorageService: SessionStorageService) {
	}

	async listApplications(_params: ApiPaginatedRequest): Promise<ApplicationListViewModel> {
		const { rows, count } = await ApplicationModel.findAndCountAll({
			// Distinct is used to fix associations being counted in the final count that's returned
			distinct: true,
			include: [{
				association: "company",
			}, {
				association: "comments",
			}],
			where: {
				user_id: this.authStorageService.getUserId(),
			},
		});
		return {
			data: rows.map((record) => this.mapper.entityToViewModel(record)),
			total: count,
		};
	}

	async getApplicationEntity(id: string) {
		return ApplicationModel.findByPk(id, {
			include: [{
				all: true,
				nested: true,
			}],
		});
	}

	async getApplication(id: string) {
		const entity = await this.getApplicationEntity(id);
		if (entity) {
			return this.mapper.entityToViewModel(entity, true);
		}
	}

	async deleteApplication(id: string) {
		const model = await this.getApplicationEntity(id);
		if (model) {
			return model.destroy();
		}
	}

	async createApplication(model: ApplicationCreateViewModel, useAppliedDate = false) {
		model.company = await this.companiesService.createCompany(model.company.name);
		const entity = await ApplicationModel.create(this.mapper.createViewModelToEntity(model, useAppliedDate), {
			raw: true,
		});
		const { id } = entity;
		/**
		 * TODOJEF:
		 * - Need to add linking here in the create
		 * - Need to clean up the linking UI and add additional columns
		 * - Potentially change the display of the link combobox, so it's more clear what we're selecting
		 * - Need to fix the row numbering, as it doesn't show the proper ordering when sorting or filtering
		 */
		await Promise.all(model.comments.map((comment) => {
			comment.applicationId = id;
			return this.createApplicationComment(comment);
		}));
		return this.getApplication(id);
	}

	async createApplications(models: ApplicationCreateViewModel[]) {
		const results: IUploadViewModelsResponse = {
			successful: 0,
			errors: [],
		};
		for (const model of models) {
			try {
				await this.createApplication(model, true);
				results.successful++;
			}
			catch (ex) {
				results.errors.push(getErrorMessage(ex));
			}
		}
		return results;
	}

	async updateApplication(viewModel: ApplicationViewModel) {
		const entity = await this.getApplicationEntity(viewModel.id);
		if (entity) {
			const { comments } = entity;
			/* Let's force updatedAt to change... this is helpful for scenarios where the associations change, but the parent
			 * record doesn't, but we still want to show that the overall entity was updated */
			entity.changed("updated_at", true);
			viewModel.company = await this.companiesService.createCompany(viewModel.company.name);
			for (const viewModelComment of viewModel.comments) {
				const { id } = viewModelComment;
				const found = comments.find((comment) => comment.id === id);
				if (found) {
					// Remove from the existing comments, so we have the remaining comments at the end, which are deletes
					entity.comments.splice(entity.comments.indexOf(found), 1);
					if (found.comment !== viewModelComment.comment) {
						await found.update(viewModelComment);
					}
				}
				// New comment
				else {
					viewModelComment.applicationId = viewModel.id;
					await this.createApplicationComment(viewModelComment);
				}
			}
			// Any remaining comments in the DB model were removed in the UI
			await Promise.all(entity.comments.map((comment) => comment.destroy()));
			const linkedTo: string[] = [];
			const linkedFrom: string[] = [];
			viewModel.links?.forEach((viewModelLink) => {
				if (viewModelLink.type === EnumLinkType.To) {
					linkedTo.push(viewModelLink.id);
				}
				else {
					linkedFrom.push(viewModelLink.id);
				}
			});
			await Promise.all([entity.setLinked(linkedTo), entity.setLinks(linkedFrom)]);
			await entity.update(this.mapper.viewModelToEntity(viewModel));
			return this.getApplication(viewModel.id);
		}
	}

	async createApplicationComment(model: ICommentViewModel) {
		const entity = await CommentModel.create(this.commentsMapper.createViewModelToEntity(model), {
			raw: true,
		});
		return this.commentsMapper.entityToViewModel(entity);
	}

	async uploadApplications(file: Express.Multer.File, addHeaders = true) {
		const results: IApplicationCreateViewModel[] = [];
		let contents = file.buffer.toString("utf8");
		if (addHeaders) {
			contents = `${CSVFields.join(";")}\n${contents}`;
		}
		const { data } = Papa.parse<IUploadApplicationModel>(contents, {
			header: true,
			skipEmptyLines: true,
			transform(value, column) {
				value = value.trim();
				if (column === "status") {
					return value ? parseInt(value, 10) : EnumApplicationStatus.Rejected;
				}
				else if (column === "dateApplied") {
					return new Date(value).getTime();
				}
				return value;
			},
		});
		for (const item of data) {
			// If there's no company or positionTitle, we ignore this entry
			if (item.company && item.positionTitle) {
				results.push(this.mapper.csvModelToViewModel(item));
			}
		}
		return results;
	}
}
