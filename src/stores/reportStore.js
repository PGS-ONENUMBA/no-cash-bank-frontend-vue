import { defineStore } from 'pinia';
import pouchDBService from '@/services/pouchdbService';

export const useReportStore = defineStore('reportStore', {
  state: () => ({
    reports: [],
  }),
  actions: {
    async fetchReports() {
      this.reports = await pouchDBService.getReports();
    },

    async addReport(report) {
      await pouchDBService.addReport(report);
      await this.fetchReports();
    },

    async deleteReport(id, rev) {
      await pouchDBService.deleteReport(id, rev);
      await this.fetchReports();
    },

    async clearReports() {
      await pouchDBService.clearDB();
      this.reports = [];
    },
  },
});
