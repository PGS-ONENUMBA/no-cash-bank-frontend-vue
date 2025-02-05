<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Page Header -->
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="fs-3">
          <i class="bi bi-clock-history"></i> Reports
        </h1>
      </div>

      <!-- Filter Section -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <form class="row g-3">
            <!-- Report Type Filter -->
            <div class="col-md-3">
              <label for="reportType" class="form-label">
                <i class="bi bi-ui-checks-grid"></i> Report Type
              </label>
              <select id="reportType" class="form-select" v-model="filters.reportType">
                <option value="">All</option>
                <option value="payments">Payments</option>
                <option value="transfers">Transfers</option>
              </select>
            </div>

            <!-- Date Range Filter -->
            <div class="col-md-3">
              <label for="dateRange" class="form-label">
                <i class="bi bi-calendar"></i> Date Range
              </label>
              <input
                type="date"
                id="dateRange"
                class="form-control"
                v-model="filters.dateRange"
              />
            </div>

            <!-- Status Filter -->
            <div class="col-md-3">
              <label for="statusFilter" class="form-label">
                <i class="bi bi-check-circle-fill"></i> Status
              </label>
              <select id="statusFilter" class="form-select" v-model="filters.status">
                <option value="">All</option>
                <option value="Successful">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <!-- Recipient Filter -->
            <div class="col-md-3">
              <label for="recipientFilter" class="form-label">
                <i class="bi bi-person-fill"></i> Recipient
              </label>
              <input
                type="text"
                id="recipientFilter"
                class="form-control"
                v-model="filters.recipient"
                placeholder="Enter recipient name"
              />
            </div>
          </form>
        </div>
      </div>

      <!-- Reports Table -->
      <div v-if="loading" class="text-center">
        <i class="spinner-border text-primary"></i> Loading reports...
      </div>

      <div v-else class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th scope="col"><i class="bi bi-hash"></i> #</th>
              <th scope="col"><i class="bi bi-clock"></i> Date</th>
              <th scope="col"><i class="bi bi-info-circle"></i> Type</th>
              <th scope="col"><i class="bi bi-currency-dollar"></i> Amount</th>
              <th scope="col"><i class="bi bi-check2-circle"></i> Status</th>
              <th scope="col"><i class="bi bi-person"></i> Recipient</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in filteredReports" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ report.date }}</td>
              <td>{{ report.type }}</td>
              <td>₦{{ report.amount }}</td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-success': report.status === 'Successful',
                    'bg-warning text-dark': report.status === 'Pending',
                    'bg-danger': report.status === 'Failed',
                  }"
                >
                  {{ report.status }}
                </span>
              </td>
              <td>{{ report.recipient }}</td>
            </tr>
            <tr v-if="filteredReports.length === 0">
              <td colspan="6" class="text-center">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Footer Menu -->
    <DashboardFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import apiService from "@/services/apiService";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";

export default {
  name: "Reports",
  components: {
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore();
    const loading = ref(true);
    const reports = ref([]);

    // Filter state
    const filters = ref({
      reportType: "",
      dateRange: "",
      status: "",
      recipient: "",
    });

    /**
     * Fetches reports from API.
     */
    const fetchReports = async () => {
      loading.value = true;
      try {
        const response = await apiService.get("/user/reports");

        if (response?.data) {
          reports.value = response.data;
        } else {
          throw new Error("Invalid API response format.");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        alert("Failed to load reports. Please try again.");
      } finally {
        loading.value = false;
      }
    };

    /**
     * Filters reports based on user input.
     */
    const filteredReports = computed(() => {
      return reports.value.filter((report) => {
        return (
          (filters.value.reportType === "" ||
            report.type.toLowerCase() === filters.value.reportType.toLowerCase()) &&
          (filters.value.status === "" ||
            report.status.toLowerCase() === filters.value.status.toLowerCase()) &&
          (filters.value.recipient === "" ||
            report.recipient.toLowerCase().includes(filters.value.recipient.toLowerCase())) &&
          (filters.value.dateRange === "" || report.date === filters.value.dateRange)
        );
      });
    });

    // Fetch reports on component mount
    onMounted(fetchReports);

    return {
      filters,
      reports,
      loading,
      filteredReports,
    };
  },
};
</script>

<style scoped>
/* Styles for the reports page */
.card {
  height: 100%;
}

.table {
  margin-bottom: 0;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: #f8f9fa;
}

.table-hover tbody tr:hover {
  background-color: #f1f1f1;
}

.badge {
  font-size: 0.9rem;
}

/* Hide sidebar on mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
