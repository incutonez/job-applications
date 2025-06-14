import { Inject, Injectable } from "@nestjs/common";
import { SessionStorageService } from "@/auth/session.storage.service";
import { SESSION_STORAGE } from "@/constants";
import { ICommentCreateModel, ICommentModel } from "@/jobs/models/CommentModel";
import { ICommentCreateViewModel, ICommentViewModel } from "@/jobs/viewModels/comment.viewmodel";

@Injectable()
export class CommentsMapper {
	constructor(@Inject(SESSION_STORAGE) private authStorageService: SessionStorageService) {}

	entityToViewModel({ application_id, user_id, comment, id, created_at, updated_at }: ICommentModel): ICommentViewModel {
		return {
			id,
			comment,
			userId: user_id,
			applicationId: application_id,
			dateCreated: created_at?.getTime(),
			dateUpdated: updated_at?.getTime(),
		};
	}

	createViewModelToEntity({ applicationId, comment }: ICommentCreateViewModel): ICommentCreateModel {
		return {
			comment: comment.trim(),
			application_id: applicationId,
			user_id: this.authStorageService.getUserId(),
		};
	}
}
