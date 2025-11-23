<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Page Header -->
      <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
      >
        <h1 class="fs-3">
          <i class="bi bi-cash-stack"></i> Request Payout
        </h1>
      </div>

      <!-- Wallet balance -->
      <WalletBalance title="Available Balance" />

      <!-- Payout Request Form -->
      <div class="card shadow-sm">
        <div class="card-header">
          <h5>
            <i class="bi bi-arrow-up-right-circle"></i> Bank Payout Details
          </h5>
          <p class="small text-muted mb-0">
            Submit a payout request. Our team will process it via bank transfer
            and update your wallet and email once completed.
          </p>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitPayoutRequest">
            <!-- Inline Fields -->
            <div class="d-flex flex-wrap gap-2">
              <!-- Bank Selection Dropdown -->
              <div class="flex-grow-1">
                <label for="bankSelect" class="form-label">
                  <i class="bi bi-bank"></i> Bank
                </label>
                <select
                  class="form-control compact-input"
                  id="bankSelect"
                  v-model="selectedBank"
                  required
                >
                  <option value="" disabled>Select</option>
                  <option
                    v-for="bank in banks"
                    :key="bank.code"
                    :value="bank.code"
                  >
                    {{ bank.name }}
                  </option>
                </select>
              </div>

              <!-- Recipient Account Number -->
              <div class="flex-grow-1">
                <label for="recipientAccount" class="form-label">
                  <i class="bi bi-credit-card"></i> Account No.
                </label>
                <input
                  type="text"
                  class="form-control compact-input"
                  id="recipientAccount"
                  v-model="recipientAccount"
                  required
                  maxlength="10"
                  inputmode="numeric"
                />
              </div>

              <!-- Amount -->
              <div class="flex-grow-1">
                <label for="amount" class="form-label">
                  <i class="bi bi-cash"></i> Amount
                </label>
                <input
                  type="number"
                  class="form-control compact-input"
                  id="amount"
                  v-model.number="amount"
                  min="1"
                  required
                />
                <small class="text-muted">
                  Max you can request now:
                  {{ formattedWalletBalance }}
                </small>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-3">
              <label for="description" class="form-label">
                <i class="bi bi-chat-dots"></i> Description (Optional)
              </label>
              <textarea
                class="form-control"
                id="description"
                v-model="description"
                rows="2"
                placeholder="Example: Payout for sales on 1st–7th, or any note to admin"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="d-grid gap-2 col-3 mt-3">
              <button class="btn btn-light" type="submit" :disabled="loading">
                <span v-if="loading">
                  <i class="spinner-border spinner-border-sm"></i>
                  Sending request...
                </span>
                <span v-else>
                  <i id="transfer" class="bi bi-send"></i>
                  Submit Request
                </span>
              </button>
            </div>
          </form>
        </div>
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
import WalletBalance from "@/components/common/WalletBalance.vue";

export default {
  name: "TransferView",
  components: {
    WalletBalance,
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore();
    const loading = ref(false);

    // raw string balance from Pinia (often "1,234.00" from backend)
    const walletBalanceRaw = computed(
      () => authStore.user?.wallet_balance || "0.00"
    );

    // numeric wallet balance for validation
    const walletBalanceNumeric = computed(() => {
      const cleaned = walletBalanceRaw.value.toString().replace(/,/g, "");
      const n = parseFloat(cleaned);
      return Number.isNaN(n) ? 0 : n;
    });

    const formattedWalletBalance = computed(() =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(walletBalanceNumeric.value)
    );

    // Payout Request Form Data – NIP codes list
    const banks = ref([
      { code: "090270", name: "AB MICROFINANCE BANK" },
      { code: "070010", name: "ABBEY MORTGAGE BANK" },
      { code: "090260", name: "ABOVE ONLY MICROFINANCE BANK" },
      { code: "090197", name: "ABU MICROFINANCE BANK" },
      { code: "000014", name: "ACCESS BANK" },
      { code: "100013", name: "ACCESS MOBILE" },
      { code: "000005", name: "ACCESS (DIAMOND) BANK" },
      { code: "090134", name: "ACCION MICROFINANCE BANK" },
      { code: "090160", name: "ADDOSSER MICROFINANCE BANK" },
      { code: "090268", name: "ADEYEMI COLLEGE STAFF MICROFINANCE BANK" },
      { code: "100028", name: "AG MORTGAGE BANK" },
      { code: "090133", name: "AL-BARAKAH MICROFINANCE BANK" },
      { code: "090259", name: "ALEKUN MICROFINANCE BANK" },
      { code: "090131", name: "ALLWORKERS MICROFINANCE BANK" },
      { code: "090169", name: "ALPHA KAPITAL MICROFINANCE BANK" },
      { code: "090116", name: "AMML MICROFINANCE BANK" },
      { code: "090143", name: "APEKS MICROFINANCE BANK" },
      { code: "090282", name: "ARISE MICROFINANCE BANK" },
      { code: "090001", name: "ASO SAVINGS" },
      { code: "090172", name: "ASTRAPOLARIS MICROFINANCE BANK" },
      { code: "090264", name: "AUCHI MICROFINANCE BANK" },
      { code: "090127", name: "BC KASH MICROFINANCE BANK" },
      { code: "090117", name: "BOCTRUST MICROFINANCE BANK LIMITED" },
      { code: "090176", name: "BOSAK MICROFINANCE BANK" },
      { code: "090148", name: "BOWEN MICROFINANCE BANK" },
      { code: "070015", name: "BRENT MORTGAGE BANK" },
      { code: "100005", name: "CELLULANT" },
      { code: "090154", name: "CEMCS MICROFINANCE BANK" },
      { code: "100015", name: "CHAMS MOBILE" },
      { code: "090141", name: "CHIKUM MICROFINANCE BANK" },
      { code: "090144", name: "CIT MICROFINANCE BANK" },
      { code: "000009", name: "CITI BANK" },
      { code: "090130", name: "CONSUMER MICROFINANCE BANK" },
      { code: "100032", name: "CONTEC GLOBAL INFOTECH LIMITED (NOWNOW)" },
      { code: "060001", name: "CORONATION BANK" },
      { code: "070006", name: "COVENANT MFB" },
      { code: "090159", name: "CREDIT AFRIQUE MICROFINANCE BANK" },
      { code: "090167", name: "DAYLIGHT MICROFINANCE BANK" },
      { code: "100021", name: "EARTHOLEUM" },
      { code: "090156", name: "E-BARCS MICROFINANCE BANK" },
      { code: "000010", name: "ECOBANK" },
      { code: "100008", name: "ECOBANK XPRESS ACCOUNT" },
      { code: "100030", name: "ECOMOBILE" },
      { code: "090097", name: "EKONDO MICROFINANCE BANK" },
      { code: "090273", name: "EMERALDS MICROFINANCE BANK" },
      { code: "090114", name: "EMPIRE TRUST MICROFINANCE BANK" },
      { code: "000019", name: "ENTERPRISE BANK" },
      { code: "100006", name: "eTRANZACT" },
      { code: "090179", name: "FAST MICROFINANCE BANK" },
      { code: "100014", name: "FBN MOBILE" },
      { code: "090107", name: "FBN MORTGAGES LIMITED" },
      { code: "060002", name: "FBNQUEST MERCHANT BANK" },
      { code: "100031", name: "FCMB MOBILE" },
      { code: "100001", name: "FET" },
      { code: "090153", name: "FFS MICROFINANCE BANK" },
      { code: "000007", name: "FIDELITY BANK" },
      { code: "100019", name: "FIDELITY MOBILE" },
      { code: "090126", name: "FIDFUND MICROFINANCE BANK" },
      { code: "090111", name: "FINATRUST MICROFINANCE BANK" },
      { code: "000016", name: "FIRST BANK OF NIGERIA" },
      { code: "000003", name: "FIRST CITY MONUMENT BANK" },
      { code: "070014", name: "FIRST GENERATION MORTGAGE BANK" },
      { code: "070002", name: "FORTIS MICROFINANCE BANK" },
      { code: "100016", name: "FORTIS MOBILE" },
      { code: "400001", name: "FSDH" },
      { code: "090145", name: "FULLRANGE MICROFINANCE BANK" },
      { code: "090158", name: "FUTO MICROFINANCE BANK" },
      { code: "070009", name: "GATEWAY MORTGAGE BANK" },
      { code: "090122", name: "GOWANS MICROFINANCE BANK" },
      { code: "090178", name: "GREENBANK MICROFINANCE BANK" },
      { code: "090195", name: "GROOMING MICROFINANCE BANK" },
      { code: "100009", name: "GT MOBILE" },
      { code: "000013", name: "GTBANK PLC" },
      { code: "090147", name: "HACKMAN MICROFINANCE BANK" },
      { code: "070017", name: "HAGGAI MORTGAGE BANK LIMITED" },
      { code: "090121", name: "HASAL MICROFINANCE BANK" },
      { code: "100017", name: "HEDONMARK" },
      { code: "000020", name: "HERITAGE BANK" },
      { code: "090175", name: "HIGHSTREET MICROFINANCE BANK" },
      { code: "090118", name: "IBILE MICROFINANCE BANK" },
      { code: "090258", name: "IMO STATE MICROFINANCE BANK" },
      { code: "100024", name: "IMPERIAL HOMES MORTGAGE BANK" },
      { code: "090157", name: "INFINITY MICROFINANCE BANK" },
      { code: "070016", name: "INFINITY TRUST MORTGAGE BANK" },
      { code: "100029", name: "INNOVECTIVES KESH" },
      { code: "100027", name: "INTELLFIN" },
      { code: "090149", name: "IRL MICROFINANCE BANK" },
      { code: "000006", name: "JAIZ BANK" },
      { code: "090003", name: "JUBILEE LIFE" },
      { code: "000002", name: "KEYSTONE BANK" },
      { code: "100025", name: "KONGAPAY" },
      { code: "100011", name: "KUDA MICROFINANCE BANK" },
      { code: "070012", name: "LAGOS BUILDING AND INVESTMENT COMPANY" },
      { code: "090177", name: "LAPO MICROFINANCE BANK" },
      { code: "090171", name: "MAINSTREET MICROFINANCE BANK" },
      { code: "090280", name: "MEGAPRAISE MICROFINANCE BANK" },
      { code: "090136", name: "MICROCRED MICROFINANCE BANK" },
      { code: "090113", name: "MICROVIS MICROFINANCE BANK" },
      { code: "100020", name: "MONEY BOX" },
      { code: "090129", name: "MONEY TRUST MICROFINANCE BANK" },
      { code: "090151", name: "MUTUAL TRUST MICROFINANCE BANK" },
      { code: "090128", name: "NDIORAH MICROFINANCE BANK" },
      { code: "090205", name: "NEW DAWN MICROFINANCE BANK" },
      { code: "090108", name: "NEW PRUDENTIAL BANK" },
      { code: "090263", name: "NIGERIAN NAVY MICROFINANCE BANK" },
      { code: "999999", name: "NIP VIRTUAL BANK" },
      { code: "090194", name: "NIRSAL NATIONAL MICROFINANCE BANK" },
      { code: "060003", name: "NOVA MERCHANT BANK LTD" },
      { code: "070001", name: "NPF MICROFINANCE BANK" },
      { code: "090119", name: "OHAFIA MICROFINANCE BANK" },
      { code: "090161", name: "OKPOGA MICROFINANCE BANK" },
      { code: "090272", name: "OLABISI ONABANJO UNIVERSITY MICROFINANCE" },
      { code: "070007", name: "OMOLUABI" },
      { code: "100026", name: "ONE FINANCE" },
      { code: "100002", name: "PAGA" },
      { code: "070008", name: "PAGE MFBank" },
      { code: "090004", name: "PARALLEX" },
      { code: "100003", name: "PARKWAY-READYCASH" },
      { code: "110001", name: "PAYATTITUDE ONLINE" },
      { code: "100004", name: "PAYCOM" },
      { code: "090137", name: "PECANTRUST MICROFINANCE BANK" },
      { code: "090196", name: "PENNYWISE MICROFINANCE BANK" },
      { code: "090135", name: "PERSONAL TRUST MICROFINANCE BANK" },
      { code: "070013", name: "PLATINUM MORTGAGE BANK" },
      { code: "000008", name: "POLARIS BANK" },
      { code: "090274", name: "PRESTIGE MICROFINANCE BANK" },
      { code: "000023", name: "PROVIDUS BANK" },
      { code: "090261", name: "QUICKFUND MICROFINANCE BANK" },
      { code: "000024", name: "RAND MERCHANT BANK" },
      { code: "070011", name: "REFUGE MORTGAGE BANK" },
      { code: "090125", name: "REGENT MICROFINANCE BANK" },
      { code: "090198", name: "RENMONEY MICROFINANCE BANK" },
      { code: "090132", name: "RICHWAY MICROFINANCE BANK" },
      { code: "090138", name: "ROYAL EXCHANGE MICROFINANCE BANK" },
      { code: "090006", name: "SAFETRUST" },
      { code: "090140", name: "SAGAMU MICROFINANCE BANK" },
      { code: "090112", name: "SEED CAPITAL MICROFINANCE BANK" },
      { code: "100007", name: "STANBIC IBTC @Ease WALLET" },
      { code: "000012", name: "STANBIC IBTC BANK" },
      { code: "000021", name: "STANDARD CHARTERED BANK" },
      { code: "090262", name: "STELLAS MICROFINANCE BANK" },
      { code: "000001", name: "STERLING BANK" },
      { code: "100022", name: "STERLING MOBILE" },
      { code: "000022", name: "SUNTRUST BANK" },
      { code: "100023", name: "TAGPAY" },
      { code: "000026", name: "TAJ BANK" },
      { code: "090115", name: "TCF MICROFINANCE BANK" },
      { code: "100010", name: "TEASY MOBILE" },
      { code: "090146", name: "TRIDENT MICROFINANCE BANK" },
      { code: "090005", name: "TRUSTBOND" },
      { code: "090276", name: "TRUSTFUND MICROFINANCE BANK" },
      { code: "000018", name: "UNION BANK" },
      { code: "000004", name: "UNITED BANK FOR AFRICA" },
      { code: "000011", name: "UNITY BANK" },
      { code: "090251", name: "UNIVERSITY OF NIGERIA NSUKKA MICROFINANCE BANK" },
      { code: "090123", name: "VERITE MICROFINANCE BANK" },
      { code: "090110", name: "VFD MFB" },
      { code: "090150", name: "VIRTUE MICROFINANCE BANK" },
      { code: "090139", name: "VISA MICROFINANCE BANK" },
      { code: "100012", name: "VT NETWORKS" },
      { code: "000017", name: "WEMA BANK" },
      { code: "090120", name: "WETLAND MICROFINANCE BANK" },
      { code: "090124", name: "XSLNCE MICROFINANCE BANK" },
      { code: "090142", name: "YES MICROFINANCE BANK" },
      { code: "000015", name: "ZENITH BANK" },
      { code: "100018", name: "ZENITH MOBILE" }
    ]);

    const selectedBank = ref("");
    const recipientAccount = ref("");
    const amount = ref("");
    const description = ref("");

    const selectedBankName = computed(() => {
      const bank = banks.value.find((b) => b.code === selectedBank.value);
      return bank ? bank.name : "";
    });

    /**
     * Submit payout request to NoCash Bank action (request_vendor_withdrawal).
     * Backend:
     *  - Stores pending withdrawal
     *  - Emails admin
     *  - Admin processes offline and updates status
     */
    const submitPayoutRequest = async () => {
      if (!selectedBank.value || !recipientAccount.value || !amount.value) {
        alert("Please fill in all required fields.");
        return;
      }

      const amt = Number(amount.value);
      if (!amt || amt <= 0) {
        alert("Amount must be greater than zero.");
        return;
      }

      if (amt > walletBalanceNumeric.value) {
        alert(
          `You cannot request more than your wallet balance (${formattedWalletBalance.value}).`
        );
        return;
      }

      loading.value = true;

      try {
        const payload = {
          action_type: "request_vendor_withdrawal",
          amount: amt,
          description: description.value,
          // Optional: send bank snapshot for admin email and logs
          bank_code: selectedBank.value,
          bank_name: selectedBankName.value,
          account_number: recipientAccount.value
        };

        // Context proxy endpoint that forwards to nocash-bank/v1/action
        const response = await apiService.post("/nocash-bank/action", payload);

        if (response?.data?.success) {
          alert(
            response.data.message ||
              "Your payout request has been submitted. You will receive an email once it is processed."
          );

          if (authStore.fetchUserData) {
            await authStore.fetchUserData();
          }

          selectedBank.value = "";
          recipientAccount.value = "";
          amount.value = "";
          description.value = "";
        } else {
          throw new Error(response?.data?.message || "Request failed.");
        }
      } catch (error) {
        console.error("Payout request error:", error);
        alert(
          error?.message ||
            "Could not submit your request. Please try again later."
        );
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      if (!authStore.user) {
        await authStore.fetchUserData();
      }
    });

    return {
      banks,
      selectedBank,
      recipientAccount,
      amount,
      description,
      loading,
      submitPayoutRequest,
      formattedWalletBalance,
    };
  },
};
</script>

<style scoped>
.card {
  height: 100%;
}

.text-success {
  color: #09b850 !important;
}

.btn-light {
  background-color: #6609b8;
  color: white;
  border: none;
  text-align: left;
}

.btn-light:hover {
  background-color: #723ba2;
}

#transfer {
  color: #fff !important;
}

.compact-input {
  display: inline-block;
  width: 100%;
  padding: 6px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
