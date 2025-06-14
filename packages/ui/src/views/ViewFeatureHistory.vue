<script setup lang="ts">
import { h, toRef } from "vue";
import {
	type AuditDiffViewModel,
	type AuditViewModel,
	EnumAuditActionTypes, EnumTableNames,
} from "@incutonez/life-stats-spec";
import type { CellContext } from "@tanstack/vue-table";
import TableData from "@/components/TableData.vue";
import TablePagination from "@/components/TablePagination.vue";
import { useDateCreatedColumn, useExpandableRow, useTableData, useUserNameColumn } from "@/composables/table.ts";
import type { ISubRowRenderer, ITableColumn, ITableData } from "@/types/components.ts";
import { capitalize, getEnumDisplay, isDefined, isObject } from "@/utils/common.ts";
import AuditDiff from "@/views/featureHistory/AuditDiff.vue";

export interface IViewFeatureHistoryProps {
	data?: AuditViewModel[];
}

const props = defineProps<IViewFeatureHistoryProps>();
const { table, search } = useTableData<AuditViewModel>({
	data: toRef(props, "data"),
	paginated: true,
	sortInitial: [{
		id: "dateCreated",
		desc: true,
	}],
	columns: [
		useExpandableRow(), {
			accessorKey: "action",
			header: "Action",
			meta: {
				columnWidth: "w-0",
				columnAlign: "center",
				cellCls({ row }) {
					switch (row.original.action) {
						case EnumAuditActionTypes.deleted:
							return "bg-red-200";
						case EnumAuditActionTypes.updated:
							return "bg-yellow-200";
						default:
							return "bg-sky-200";
					}
				},
			},
			cell(props) {
				return capitalize(props.getValue<string>());
			},
		}, {
			accessorKey: "entity",
			header: "Entity",
			cell: (info) => getEnumDisplay(EnumTableNames, info.getValue<number>()),
		}, {
			accessorKey: "entityId",
			header: "Entity ID",
		},
		useUserNameColumn(),
		useDateCreatedColumn(),
	],
});

function getAuditValue(props: CellContext<AuditDiffViewModel, unknown>) {
	const value = props.getValue<unknown>();
	if (!isDefined(value)) {
		return "";
	}
	if (Array.isArray(value) || isObject(value)) {
		return h(AuditDiff, {
			value,
		});
	}
	return h("pre", {
		class: "text-sm",
	}, String(value));
}

function renderSubRows({ row }: ISubRowRenderer<AuditViewModel>) {
	const { action, diff } = row.original;
	const columns: ITableColumn<AuditDiffViewModel>[] = [{
		accessorKey: "field",
		header: "Field",
		meta: {
			columnWidth: "w-auto",
			cellCls: "w-0",
		},
	}];
	if (action === EnumAuditActionTypes.updated) {
		columns.unshift({
			accessorKey: "action",
			header: "Action",
			meta: {
				columnWidth: "w-auto",
				cellCls: "w-0",
				columnAlign: "center",
			},
		});
		columns.push({
			accessorKey: "valuePrevious",
			header: "Previous",
			cell: (props) => getAuditValue(props),
		}, {
			accessorKey: "valueCurrent",
			header: "Current",
			cell: (props) => getAuditValue(props),
		});
	}
	else if (action === EnumAuditActionTypes.created) {
		columns.push({
			accessorKey: "valueCurrent",
			header: "Value",
			cell: (props) => getAuditValue(props),
		});
	}
	else if (action === EnumAuditActionTypes.deleted) {
		columns.push({
			accessorKey: "valuePrevious",
			header: "Value",
			cell: (props) => getAuditValue(props),
		});
	}
	const auditDiffTable = useTableData<AuditDiffViewModel>({
		columns,
		data: diff,
	});
	return h<ITableData<AuditDiffViewModel>>(TableData, {
		table: auditDiffTable.table,
		class: "p-2",
		isSubRow: true,
		tableLayout: "table-auto",
	});
}
</script>

<template>
	<article class="flex flex-col size-full">
		<TablePagination
			v-model:search="search"
			:table="table"
		/>
		<TableData
			:table="table"
			:render-sub-rows="renderSubRows"
			table-layout="table-auto"
			class="flex-1"
		/>
	</article>
</template>
