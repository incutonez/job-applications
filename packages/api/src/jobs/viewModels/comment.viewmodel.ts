import { ModelInterface } from "@/types";
import { BaseViewModel } from "@/viewModels/BaseViewModel";

export type ICommentViewModel = ModelInterface<CommentViewModel>;

export type ICommentCreateViewModel = ModelInterface<CommentCreateViewModel>;

export class CommentCreateViewModel extends BaseViewModel {
	declare comment: string;

	declare applicationId: string;
}

export class CommentViewModel extends CommentCreateViewModel {
	declare id: string;
}
