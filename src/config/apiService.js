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

  // Admin Sidebar List APIs
  getStates: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.STATES_LIST, data),
  getPlantationSites: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.PLANTATION_SITES_LIST, data),
  getSpecies: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.SPECIES_LIST, data),
  getCategories: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.CATEGORIES_LIST, data),
  getOccasions: (params = {}) => getAuth(ENDPOINTS.OCCASIONS_LIST, params),
  getTournaments: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.TOURNAMENTS_LIST, data),
  getTeams: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.TEAMS_LIST, data),
  getMatches: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.MATCHES_LIST, data),
  getNurseries: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.NURSERIES_LIST, data),
  getAdmins: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.ADMINS_LIST, data),
  getEmissionFactors: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.EMISSION_FACTORS_LIST, data),
  getCarbonFootprints: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.CARBON_FOOTPRINT_LIST, data),
  getOccasionPlantations: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.OCCASION_PLANTATIONS_LIST, data),
  getMatchPlantations: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.MATCH_PLANTATIONS_LIST, data),
  getTeamPlantations: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.TEAM_PLANTATIONS_LIST, data),
  getCarbonPlantations: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.CARBON_PLANTATIONS_LIST, data),
  getAllPlantations: (data = { page: 1, limit: 100 }) => postAuth(ENDPOINTS.PLANTATION_LIST, data),
  getPayments: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.PAYMENT_LIST, data),
  getCertificates: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.CERTIFICATE_LIST, data),
  getSiteInventory: (data = { page: 1, limit: 10 }) => postAuth(ENDPOINTS.SITE_INVENTORY_LIST, data),
  getCertificateTemplates: (payload) => postAuth(ENDPOINTS.CERTIFICATE_TEMPLATES_LIST, payload),
  getStatesLocation: () => getAuth(ENDPOINTS.LOCATION_STATES),
};