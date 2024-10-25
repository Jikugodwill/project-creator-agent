import { createModel } from "@rematch/core";

import { AddFundingSourceInputs, CreateProjectInputs } from "./types";

export type CreateProjectState = CreateProjectInputs & {
  accountId: string;
  submissionError: string;
  submissionStatus: "pending" | "done" | "sending";
  isEdit: boolean;
  isRegistered: boolean;
  checkRegistrationStatus: "pending" | "fetching" | "ready";
  checkPreviousProjectDataStatus: "pending" | "fetching" | "ready";
  daoProjectProposal: { id: number; status: "Approved" | "InProgress" | "Failed" | null } | null;
  isRepositoryRequired: boolean;
};

/**
 * Create Project State
 */
const initialState: CreateProjectState = {
  accountId: "",
  submissionError: "",
  submissionStatus: "pending",
  isEdit: false,
  isRegistered: false,
  checkRegistrationStatus: "pending",
  checkPreviousProjectDataStatus: "pending",
  daoProjectProposal: null,
  isRepositoryRequired: false,

  // Inputs
  name: "",
  isDao: false,
  daoAddress: "",
  backgroundImage: "",
  profileImage: "",
  teamMembers: [],
  categories: [],
  description: "",
  publicGoodReason: "",
  smartContracts: [],
  fundingSources: [],
  githubRepositories: [],
  website: "",
  twitter: "",
  telegram: "",
  github: "",
};

export const projectEditorModel = createModel()({
  state: initialState,

  reducers: {
    setAccountId(state: CreateProjectState, accountId: string) {
      state.accountId = accountId;
    },

    setProjectName(state: CreateProjectState, name?: string) {
      state.name = name || "";
    },

    setIsDao(state: CreateProjectState, isDao: boolean) {
      state.isDao = isDao;
    },

    setDaoAddress(state: CreateProjectState, daoAddress: string) {
      state.daoAddress = daoAddress;
    },

    setCategories(state: CreateProjectState, categories: string[]) {
      state.isRepositoryRequired = categories.includes("Open Source");
      state.categories = categories;
    },

    addTeamMember(state: CreateProjectState, accountId: string) {
      if (state.teamMembers.indexOf(accountId) === -1) {
        state.teamMembers = [...state.teamMembers, accountId];
      }
    },

    setTeamMembers(state: CreateProjectState, members: string[]) {
      state.teamMembers = members;
    },

    removeTeamMember(state: CreateProjectState, accountId: string) {
      state.teamMembers = state.teamMembers.filter(
        (_accountId) => _accountId !== accountId
      );
    },

    setFundingSources(
      state: CreateProjectState,
      fundingSources: AddFundingSourceInputs[]
    ) {
      state.fundingSources = fundingSources;
    },

    addFundingSource(
      state: CreateProjectState,
      fundingSourceData: AddFundingSourceInputs
    ) {
      if (state.fundingSources) {
        state.fundingSources = [...state.fundingSources, fundingSourceData];
      } else {
        state.fundingSources = [fundingSourceData];
      }
    },

    removeFundingSource(state: CreateProjectState, index: number) {
      const currentFundingSources = state.fundingSources || [];
      state.fundingSources = currentFundingSources.filter(
        (_, _index) => _index !== index
      );
    },

    updateFundingSource(
      state: CreateProjectState,
      payload: { fundingSourceData: AddFundingSourceInputs; index: number }
    ) {
      const currentFundingSources = state.fundingSources || [];
      const updatedFunding = [...currentFundingSources];
      updatedFunding[payload.index] = payload.fundingSourceData;
      state.fundingSources = updatedFunding;
    },

    setSmartContracts(state: CreateProjectState, smartContracts: string[][]) {
      state.smartContracts = smartContracts;
    },

    setRepositories(state: CreateProjectState, repositories: string[]) {
      state.githubRepositories = repositories;
    },

    addRepository(state: CreateProjectState) {
      const repos = state.githubRepositories || [];
      state.githubRepositories = [...repos, ""];
    },

    updateRepositories(state: CreateProjectState, repositories: string[]) {
      state.githubRepositories = repositories.filter((repo) => repo.length > 0);
    },

    RESET() {
      return initialState;
    },
  },
});
