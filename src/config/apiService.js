import { API_CONFIG, ENDPOINTS } from "./endpoints";
import {
  getAuth,
  postAuth,
  putAuth,
  deleteAuth,
  getPublic,
  postPublic,
} from "./axiosClient";
import { data } from "react-router-dom";

export const apiService = {
  adminLogin: (data) => postPublic(ENDPOINTS.ADMIN_LOGIN, data),
  getDashboardStats: () => postAuth(ENDPOINTS.ADMIN_STATS, {}),
  getAdminProfile: () => postAuth(ENDPOINTS.ADMIN_PROFILE, {}),

  // Admin Sidebar List APIs
  getStates: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.STATES_LIST, data),
  addState: (data) => postAuth(ENDPOINTS.STATE_ADD, data),
  updateState: (data) => putAuth(ENDPOINTS.STATE_UPDATE, data),
  deleteState: (data) => deleteAuth(ENDPOINTS.STATE_DELETE, { data }),
  getPlantationSites: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.PLANTATION_SITES_LIST, data),
  addPlantationSite: (data) => postAuth(ENDPOINTS.SITE_ADD, data),
  updatePlantationSite: (data) => putAuth(ENDPOINTS.SITE_UPDATE, data),
  deletePlantationSite: (data) => deleteAuth(ENDPOINTS.SITE_DELETE, { data }),
  getSpecies: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.SPECIES_LIST, data),
  addSpecies: (data) => postAuth(ENDPOINTS.SPECIES_ADD, data),
  updateSpecies: (data) => putAuth(ENDPOINTS.SPECIES_UPDATE, data),
  deleteSpecies: (data) => deleteAuth(ENDPOINTS.SPECIES_DELETE, { data }),
  getCategories: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.CATEGORIES_LIST, data),
  addCategory: (data) => postAuth(ENDPOINTS.CATEGORY_ADD, data),
  updateCategory: (data) => putAuth(ENDPOINTS.CATEGORY_UPDATE, data),
  deleteCategory: (data) => deleteAuth(ENDPOINTS.CATEGORY_DELETE, { data }),
  getOccasions: (params = {}) => getAuth(ENDPOINTS.OCCASIONS_LIST, params),
  addOccasion: (data) => postAuth(ENDPOINTS.OCCASION_ADD, data),
  updateOccasion: (data) => putAuth(ENDPOINTS.OCCASION_UPDATE, data),
  deleteOccasion: (data) => deleteAuth(ENDPOINTS.OCCASION_DELETE, { data }),
  getTournaments: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.TOURNAMENTS_LIST, data),
  addTournament: (data) => postAuth(ENDPOINTS.TOURNAMENT_ADD, data),
  updateTournament: (data) => putAuth(ENDPOINTS.TOURNAMENT_UPDATE, data),
  deleteTournament: (data) => deleteAuth(ENDPOINTS.TOURNAMENT_DELETE, { data }),
  getTeams: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.TEAMS_LIST, data),
  addTeam: (data) => postAuth(ENDPOINTS.TEAM_ADD, data),
  updateTeam: (data) => putAuth(ENDPOINTS.TEAM_UPDATE, data),
  deleteTeam: (data) => deleteAuth(ENDPOINTS.TEAM_DELETE, { data }),
  getMatches: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.MATCHES_LIST, data),
  addMatch: (data) => postAuth(ENDPOINTS.MATCH_ADD, data),
  updateMatch: (data) => putAuth(ENDPOINTS.MATCH_UPDATE, data),
  deleteMatch: (data) => deleteAuth(ENDPOINTS.MATCH_DELETE, { data }),
  getNurseries: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.NURSERIES_LIST, data),
  addNursery: (data) => postAuth(ENDPOINTS.NURSERY_ADD, data),
  updateNursery: (data) => putAuth(ENDPOINTS.NURSERY_UPDATE, data),
  deleteNursery: (data) => deleteAuth(ENDPOINTS.NURSERY_DELETE, { data }),
  getAdmins: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.ADMINS_LIST, data),
  addAdmin: (data) => postAuth(ENDPOINTS.ADMIN_ADD, data),
  updateAdmin: (data) => putAuth(ENDPOINTS.ADMIN_UPDATE, data),
  deleteAdmin: (data) => deleteAuth(ENDPOINTS.ADMIN_DELETE, { data }),
  getEmissionFactors: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.EMISSION_FACTORS_LIST, data),
  addEmissionFactor: (data) => postAuth(ENDPOINTS.EMISSION_FACTOR_ADD, data),
  updateEmissionFactor: (data) =>
    putAuth(ENDPOINTS.EMISSION_FACTOR_UPDATE, data),
  deleteEmissionFactor: (data) =>
    deleteAuth(ENDPOINTS.EMISSION_FACTOR_DELETE, { data }),
  getCarbonFootprints: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.CARBON_FOOTPRINT_LIST, data),
  getOccasionPlantations: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.OCCASION_PLANTATIONS_LIST, data),
  getMatchPlantations: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.MATCH_PLANTATIONS_LIST, data),
  getTeamPlantations: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.TEAM_PLANTATIONS_LIST, data),
  getCarbonPlantations: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.CARBON_PLANTATIONS_LIST, data),
  getAllPlantations: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.PLANTATION_LIST, data),
  getPayments: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.PAYMENT_LIST, data),
  deletePayment: (data) => deleteAuth(ENDPOINTS.PAYMENT_DELETE, { data }),
  getCertificates: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.CERTIFICATES_LIST || ENDPOINTS.CERTIFICATE_LIST, data),
  addCertificate: (data) => postAuth(ENDPOINTS.CERTIFICATE_ADD, data),
  updateCertificate: (data) => putAuth(ENDPOINTS.CERTIFICATE_UPDATE, data),
  deleteCertificate: (data) =>
    deleteAuth(ENDPOINTS.CERTIFICATE_DELETE, { data }),
  getCertificateTemplates: (data = { page: 1, limit: 100 }) =>
    postAuth(ENDPOINTS.CERTIFICATE_TEMPLATES_LIST, data),
  addCertificateTemplate: (data) =>
    postAuth(ENDPOINTS.CERTIFICATE_TEMPLATE_ADD, data),
  updateCertificateTemplate: (data) =>
    putAuth(ENDPOINTS.CERTIFICATE_TEMPLATE_UPDATE, data),
  deleteCertificateTemplate: (data) =>
    deleteAuth(ENDPOINTS.CERTIFICATE_TEMPLATE_DELETE, { data }),
  getSiteInventory: (data = { page: 1, limit: 10 }) =>
    postAuth(ENDPOINTS.SITE_INVENTORY_LIST, data),
  getStatesLocation: () => getAuth(ENDPOINTS.LOCATION_STATES),
  generateForm: (data) => postAuth(ENDPOINTS.REGENERATE_FORM),
};
