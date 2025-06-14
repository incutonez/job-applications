<script setup lang="ts">
import { h, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { type ApplicationViewModel, type CommentViewModel } from "@incutonez/life-stats-spec";
import BaseButton from "@/components/BaseButton.vue";
import { IconAdd, IconDelete, IconEdit } from "@/components/Icons.ts";
import TableData from "@/components/TableData.vue";
import TablePagination from "@/components/TablePagination.vue";
import { injectGlobalError } from "@/composables/app.ts";
import {
	useDateCreatedColumn,
	useDateUpdatedColumn,
	useExpandableRow, useRowNumbering,
	useTableActions,
	useTableData,
} from "@/composables/table.ts";
import { RouteCreate } from "@/constants.ts";
import { getApplicationRecords } from "@/stores/applications.ts";
import { useAppSelector } from "@/stores/main.ts";
import type { ISubRowRenderer, ITableColumn, ITableData } from "@/types/components.ts";
import { pasteToApplicationViewModel } from "@/utils/common.ts";
import { providePastedApplication, useApplicationsList, useDeleteApplication } from "@/views/jobs/composables/applications.ts";
import { useJobRoutes } from "@/views/jobs/composables/routes.ts";
import { getApplicationRowCls, useApplicationsColumns } from "@/views/jobs/composables/table.ts";
import { RouteJobApplications } from "@/views/jobs/constants.ts";
import DeleteDialog from "@/views/shared/DeleteDialog.vue";

export interface IViewApplicationsProps {
	data?: ApplicationViewModel[];
	showCompany?: boolean;
	viewRoute?: string;
	isSubRow?: boolean;
}

const { data = undefined, showCompany = true, viewRoute = undefined, isSubRow = false } = defineProps<IViewApplicationsProps>();
const { deleteApplication, deletingApplication } = useDeleteApplication();
const { viewApplication } = useJobRoutes();
const { errorTitle, errorMsg, errorMsgStack } = injectGlobalError();
const pastedRecord = providePastedApplication();
const showDelete = ref(false);
const route = useRoute();
const selectedRow = ref<ApplicationViewModel>();
const columns = ref<ITableColumn<ApplicationViewModel>[]>();
const { table, search } = useTableData<ApplicationViewModel>({
	columns,
	data: data ?? useAppSelector(getApplicationRecords),
	paginated: true,
	canExpand(row) {
		return !!row.original.comments.length;
	},
	sortInitial: [{
		id: "dateApplied",
		desc: true,
	}],
});
columns.value = [
	useRowNumbering(),
	useExpandableRow(),
	useTableActions([{
		icon: IconEdit,
		handler(record) {
			viewApplication(record.id, viewRoute);
		},
	}, {
		icon: IconDelete,
		handler(record) {
			selectedRow.value = record;
			showDelete.value = true;
		},
	}]),
	...useApplicationsColumns(table, showCompany),
	useDateCreatedColumn(),
	useDateUpdatedColumn(),
];


function renderCommentRows({ row }: ISubRowRenderer<ApplicationViewModel>) {
	const table = useTableData<CommentViewModel>({
		data: row.original.comments,
		columns: [{
			accessorKey: "comment",
			// eslint-disable-next-line @incutonez/array-bracket-newline
		}, useDateCreatedColumn(), useDateUpdatedColumn()],
	});

	return h<ITableData<CommentViewModel>>(TableData, {
		table: table.table,
		isSubRow: true,
		hideHeaders: true,
	});
}

function onClickAddApplication() {
	viewApplication(RouteCreate, viewRoute);
}

async function onClickDelete() {
	await deleteApplication(selectedRow.value);
	showDelete.value = false;
}

function onPaste(event: ClipboardEvent) {
	// We don't want the pasting to hijack any pasting we do that's in a dialog or different route
	if (route.name !== RouteJobApplications) {
		return;
	}
	event.stopPropagation();
	event.preventDefault();
	const paste = event.clipboardData?.getData("text");
	if (paste) {
		try {
			const item = pasteToApplicationViewModel(paste);
			if (item) {
				pastedRecord.value = item;
				viewApplication(RouteCreate);
			}
		}
		catch (error) {
			errorTitle.value = "Paste Error";
			errorMsg.value = "Paste is invalid";
			errorMsgStack.value = `Your paste was: ${paste}`;
			throw error;
		}
	}
}

addEventListener("paste", onPaste, true);

onUnmounted(() => removeEventListener("paste", onPaste));

if (!data) {
	useApplicationsList();
}
</script>

<template>
	<article class="size-full flex flex-col">
		<TablePagination
			v-model:search="search"
			:table="table"
		>
			<template #after-search>
				<BaseButton
					text="Application"
					theme="info"
					:icon="IconAdd"
					@click="onClickAddApplication"
				/>
			</template>
		</TablePagination>
		<TableData
			class="flex-1"
			table-layout="table-auto"
			:is-sub-row="isSubRow"
			:table="table"
			:row-cls="getApplicationRowCls"
			:render-sub-rows="renderCommentRows"
		/>
		<DeleteDialog
			v-model="showDelete"
			entity-name="this application"
			:loading="deletingApplication"
			@delete="onClickDelete"
		/>
		<RouterView />
	</article>
</template>
