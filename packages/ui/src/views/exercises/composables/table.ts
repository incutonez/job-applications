import { h } from "vue";
import {
	type ActivityAttributeViewModel,
	type ActivityCreateViewModel,
	EnumActivitySource,
	EnumUnitTypes,
} from "@incutonez/life-stats-spec";
import TableData from "@/components/TableData.vue";
import { useDateColumn, useTableData } from "@/composables/table.ts";
import type { ITableColumn, ITableData } from "@/types/components.ts";
import { getEnumDisplay } from "@/utils/common.ts";
import { numberToDisplay } from "@/utils/formatters.ts";
import CellActivityDetails from "@/views/exercises/CellActivityDetails.vue";

export function useActivitiesColumns<T extends ActivityCreateViewModel>(): ITableColumn<T>[] {
	return [
		useDateColumn("dateOccurred", "Date"), {
			accessorKey: "activityType.name",
			header: "Type",
			meta: {
				columnWidth: "w-max",
				columnAlign: "center",
			},
		}, {
			accessorKey: "title",
			header: "Title",
		}, {
			accessorKey: "description",
			header: "Description",
		}, {
			accessorKey: "calories",
			header: "Details",
			meta: {
				columnWidth: "min-w-auto",
			},
			cell({ row }) {
				const { calories, weightLost, duration } = row.original;
				return h(CellActivityDetails, {
					calories,
					weightLost,
					duration,
				});
			},
		}, {
			accessorKey: "source",
			header: "Source",
			meta: {
				columnWidth: "w-max",
			},
			cell(info) {
				const value = info.getValue<number>();
				if (value === EnumActivitySource.None) {
					return "";
				}
				return getEnumDisplay(EnumActivitySource, value);
			},
		}, {
			id: "attribute",
			accessorKey: "attributes",
			header: "Attributes",
			meta: {
				cellCls: "!p-0 align-top",
			},
			cell(info) {
				const attributes = info.getValue<ActivityAttributeViewModel[]>();
				const attributesTable = useTableData<ActivityAttributeViewModel>({
					data: attributes,
					sortInitial: [{
						desc: false,
						id: "attributeTypeName",
					}],
					columns: useAttributesColumns(),
				});
				return h<ITableData<ActivityAttributeViewModel>>(TableData, {
					table: attributesTable.table,
					hideHeaders: true,
					class: "!border-0",
				});
			},
		},
	];
}

export function useAttributesColumns<T extends ActivityAttributeViewModel>(): ITableColumn<T>[] {
	return [{
		id: "attributeTypeName",
		accessorKey: "attributeType.name",
		header: "Attribute",
	}, {
		accessorKey: "value",
		header: "Value",
		meta: {
			cellCls: "!border-r-0",
		},
		cell(info) {
			const { original } = info.row;
			const display: string[] = [];
			const value = original.valueDisplay || original.value;
			let isNumber = true;
			switch (original.unitDisplay ?? original.unit) {
				case EnumUnitTypes.KilometersPerHour:
					display.push("kph");
					break;
				case EnumUnitTypes.Meters:
					display.push("m");
					break;
				case EnumUnitTypes.Kilometers:
					display.push("km");
					break;
				case EnumUnitTypes.MilesPerHour:
					display.push("mph");
					break;
				case EnumUnitTypes.Feet:
					display.push("ft");
					break;
				case EnumUnitTypes.Miles:
					display.push("mi");
					break;
				case EnumUnitTypes.Hours:
					display.push("hours");
					break;
				case EnumUnitTypes.Minutes:
					display.push("mins");
					break;
				case EnumUnitTypes.Seconds:
					display.push("secs");
					break;
				default:
					isNumber = false;
			}
			if (isNumber) {
				display.unshift(numberToDisplay(value));
			}
			else {
				display.unshift(value);
			}
			return display.join(" ");
		},
	}];
}
