import { Inject, Injectable } from "@nestjs/common";
import { SessionStorageService } from "@/auth/session.storage.service";
import { SESSION_STORAGE } from "@/constants";
import { CompaniesMapper } from "@/jobs/companies/companies.mapper";
import { CompanyModel } from "@/jobs/models/CompanyModel";
import { CompanyFullListViewModel, CompanyListViewModel } from "@/jobs/viewModels/company.viewmodel";

@Injectable()
export class CompaniesService {
	constructor(private mapper: CompaniesMapper, @Inject(SESSION_STORAGE) private authStorageService: SessionStorageService) {
	}

	async getCompanies(): Promise<CompanyListViewModel> {
		const { rows, count } = await CompanyModel.findAndCountAll({
			where: {
				user_id: this.authStorageService.getUserId(),
			},
		});
		return {
			total: count,
			data: rows.map((company) => this.mapper.entityToViewModel(company)),
		};
	}

	async getCompaniesList(): Promise<CompanyFullListViewModel> {
		const { rows, count } = await CompanyModel.findAndCountAll({
			distinct: true,
			include: [{
				association: "applications",
				include: ["comments"],
			}],
			where: {
				user_id: this.authStorageService.getUserId(),
			},
		});
		return {
			total: count,
			data: rows.map((company) => this.mapper.entityFullToViewModel(company)),
		};
	}

	async createCompany(name: string) {
		name = name.trim();
		const [response] = await CompanyModel.findOrCreate({
			where: {
				name,
			},
			defaults: {
				name,
				user_id: this.authStorageService.getUserId(),
			},
		});
		return this.mapper.entityToViewModel(response);
	}

	async deleteCompany(id: string) {
		return CompanyModel.destroy({
			where: {
				id,
			},
		});
	}
}
