import PouchDB from 'pouchdb';

const db = new PouchDB('reports_db');

export default {
  async addReport(report) {
    report._id = new Date().toISOString(); // Unique ID
    return db.put(report);
  },

  async getReports() {
    const result = await db.allDocs({ include_docs: true });
    return result.rows.map(row => row.doc);
  },

  async getReportById(id) {
    return db.get(id);
  },

  async deleteReport(id, rev) {
    return db.remove(id, rev);
  },

  async clearDB() {
    return db.destroy().then(() => new PouchDB('reports_db'));
  }
};
