﻿<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { IconDownload, IconHistory, IconJobApplications, IconJobCompanies } from "@/components/Icons.ts";
import { isRouteSelected } from "@/router/index.ts";
import {
	RouteJobApplications, RouteJobAudits,
	RouteJobCompanies, useJobRoutes,
} from "@/router/jobs.ts";
import ViewApplicationsImport from "@/views/jobs/ViewApplicationsImport.vue";

const showImportDialog = ref(false);
const { viewApplications, viewCompanies, viewHistory } = useJobRoutes();

function onClickViewApplications() {
	viewApplications();
}

function onClickViewCompanies() {
	viewCompanies();
}

function onClickImportApplications() {
	showImportDialog.value = true;
}

function onClickHistory() {
	viewHistory();
}
</script>

<template>
	<nav class="flex space-x-4">
		<BaseButton
			:icon="IconJobApplications"
			text="Applications"
			theme="navigation"
			:aria-selected="isRouteSelected(RouteJobApplications)"
			@click="onClickViewApplications"
		/>
		<BaseButton
			:icon="IconJobCompanies"
			text="Companies"
			theme="navigation"
			:aria-selected="isRouteSelected(RouteJobCompanies)"
			@click="onClickViewCompanies"
		/>
		<BaseButton
			:icon="IconDownload"
			text="Import"
			theme="navigation"
			@click="onClickImportApplications"
		/>
		<BaseButton
			:icon="IconHistory"
			text="History"
			theme="navigation"
			:aria-selected="isRouteSelected(RouteJobAudits)"
			@click="onClickHistory"
		/>
		<ViewApplicationsImport
			v-if="showImportDialog"
			v-model="showImportDialog"
		/>
	</nav>
</template>
