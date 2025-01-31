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
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
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
          <div class="table-responsive">
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
    </div>
  </template>
  
  <script>
  export default {
    name: "Reports",
    data() {
      return {
        filters: {
          reportType: "",
          dateRange: "",
          status: "",
          recipient: "",
        },
        reports: [
          {
            date: "2025-01-15",
            type: "Transfer",
            amount: "5000",
            status: "Successful",
            recipient: "John Doe",
          },
          {
            date: "2025-01-14",
            type: "Payment",
            amount: "10000",
            status: "Failed",
            recipient: "ABC Corp",
          },
          {
            date: "2025-01-13",
            type: "Transfer",
            amount: "7500",
            status: "Pending",
            recipient: "Jane Smith",
          },
        ],
      };
    },
    computed: {
      /**
       * Filters the reports based on user input.
       */
      filteredReports() {
        return this.reports.filter((report) => {
          return (
            (this.filters.reportType === "" ||
              report.type.toLowerCase() === this.filters.reportType.toLowerCase()) &&
            (this.filters.status === "" ||
              report.status.toLowerCase() === this.filters.status.toLowerCase()) &&
            (this.filters.recipient === "" ||
              report.recipient
                .toLowerCase()
                .includes(this.filters.recipient.toLowerCase())) &&
            (this.filters.dateRange === "" || report.date === this.filters.dateRange)
          );
        });
      },
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
  
  .btn-orange {
    background-color: #ff6f00;
    color: white;
    border: none;
  }
  
  .btn-orange:hover {
    background-color: #e65d00;
  }
  </style>
  