import { h, isRef, ref, unref, type VNode, watch } from "vue";
import {
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel, getPaginationRowModel,
	getSortedRowModel,
	useVueTable,
} from "@tanstack/vue-table";
import BaseButton from "@/components/BaseButton.vue";
import CellDateTime from "@/components/CellDateTime.vue";
import { IconDown, IconRight } from "@/components/Icons.ts";
import type {
	ISortIdentity,
	ITable,
	ITableAction,
	ITableCellContext,
	ITableColumn,
	IUseTableData,
	TTableExpandedState,
} from "@/types/components.ts";
import { getUserName } from "@/utils/common.ts";

export function useTableData<TData = unknown>({ data, columns, sortInitial, searchInitial = "", canExpand, paginated }: IUseTableData<TData>) {
	const sorting = ref(sortInitial);
	const search = ref(searchInitial);
	const expanded = ref<TTableExpandedState>({});
	const table = useVueTable({
		get data() {
			return unref(data) ?? [];
		},
		get columns() {
			return unref(columns) ?? [];
		},
		globalFilterFn: "includesString",
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getRowCanExpand: canExpand ?? (() => true),
		getSortedRowModel: getSortedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
		initialState: {
			pagination: {
				pageSize: 50,
				pageIndex: 0,
			},
		},
		state: {
			get globalFilter() {
				return search.value;
			},
			get sorting() {
				return sorting.value;
			},
			get expanded() {
				return expanded.value;
			},
		},
		onSortingChange(updater) {
			sorting.value = updater instanceof Function ? updater(sorting.value ?? []) : updater;
		},
		onGlobalFilterChange(updaterOrValue) {
			search.value = typeof updaterOrValue === "function" ? updaterOrValue(search.value) : updaterOrValue;
		},
		onExpandedChange(updaterOrValue) {
			expanded.value = typeof updaterOrValue === "function" ? updaterOrValue(expanded.value) : updaterOrValue;
		},
	}) as ITable<TData>;

	table.getColumnSortIdentity = (columnId: string) => {
		let identity: ISortIdentity = 1;
		const $sorting = table.getState().sorting;
		if ($sorting) {
			identity = $sorting.find(({ id }) => id === columnId)?.desc ? 1 : -1;
		}
		return identity;
	};

	// Whenever the data changes, we have to make sure we reset the expanded state, as it could be invalid
	watch(isRef(data) ? data : () => data, () => table.resetExpanded());

	return {
		table,
		search,
	};
}

export function useTableActions<T>(buttons: ITableAction<T>[]): ITableColumn<T> {
	return {
		header: "Actions",
		meta: {
			columnAlign: "center",
			columnWidth: "w-24",
			cellCls: "w-24",
		},
		cell(info: ITableCellContext<T>) {
			const children: VNode[] = [];
			for (const button of buttons) {
				const { canClick } = button;
				if (!canClick || canClick(info.row.original)) {
					children.push(h(BaseButton, {
						theme: "table",
						...button,
						onClick() {
							button.handler(info.row.original);
						},
					}));
				}
			}
			if (children.length) {
				return h("article", {
					class: "flex place-content-center",
				}, children);
			}
		},
	};
}

export function useRowNumbering<T>(): ITableColumn<T> {
	return {
		accessorKey: "id",
		header: "Row",
		cell: (info) => parseInt(info.row.id) + 1,
		meta: {
			columnWidth: "min-w-auto",
			columnAlign: "center",
		},
	};
}

export function useDateColumn<T>(accessorKey: string, header: string, width = "min-w-28 w-28"): ITableColumn<T> {
	return {
		accessorKey,
		header,
		cell: (info) => {
			return h(CellDateTime, {
				value: info.getValue<number>(),
			});
		},
		meta: {
			columnWidth: width,
			cellCls: `${width} text-sm font-semibold`,
			columnAlign: "center",
		},
	};
}

export function useDateUpdatedColumn<T>(): ITableColumn<T> {
	return useDateColumn("dateUpdated", "Updated");
}

export function useDateCreatedColumn<T>(): ITableColumn<T> {
	return useDateColumn("dateCreated", "Created");
}

export function useUserNameColumn<T>(): ITableColumn<T> {
	return {
		accessorKey: "userId",
		header: "User",
		meta: {
			columnWidth: "w-auto",
			cellCls: "w-0",
			columnAlign: "center",
		},
		// TODO: Replace with getting this in the API call, not here
		cell: (props) => getUserName(props.getValue<string>()),
	};
}

export function useExpandableRow<T>(): ITableColumn<T> {
	return {
		id: "expander",
		header: () => null,
		meta: {
			columnWidth: "min-w-12 w-12",
			cellCls: "min-w-12 w-12",
		},
		cell({ row }: ITableCellContext<T>) {
			if (row.getCanExpand()) {
				return h("article", {
					class: "flex place-content-center",
				}, [h(BaseButton, {
					icon: row.getIsExpanded() ? IconDown : IconRight,
					onClick: row.getToggleExpandedHandler(),
					theme: "table",
				})]);
			}
		},
	};
}
