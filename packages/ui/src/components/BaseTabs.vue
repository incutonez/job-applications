<script setup lang="ts">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from "reka-ui";

export interface IBaseTabProps {
	title: string;
	value?: string;
	disabled?: boolean;
	contentClasses?: string;
}

export interface IBaseTabsProps {
	tabs: IBaseTabProps[];
}

const { tabs } = defineProps<IBaseTabsProps>();

function getDefaultSelectedTab() {
	const [firstTab] = tabs;
	return firstTab?.value ?? firstTab?.title;
}
</script>

<template>
	<TabsRoot
		as="article"
		class="size-full flex flex-col"
		:default-value="getDefaultSelectedTab()"
	>
		<TabsList>
			<TabsIndicator />
			<TabsTrigger
				v-for="{ title, value = title } in tabs"
				:key="value"
				:value="value"
				class="base-tab"
			>
				{{ title }}
			</TabsTrigger>
		</TabsList>
		<TabsContent
			v-for="tab in tabs"
			:key="`content-${tab.value ?? tab.title}`"
			class="flex-1 border"
			:class="tab.contentClasses"
			:value="tab.value ?? tab.title"
		>
			<slot :name="tab.title" />
		</TabsContent>
	</TabsRoot>
</template>
