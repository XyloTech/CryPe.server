// CryPe Dashboard Client Logic
(function() {
  let allUsers = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let autoSyncInterval = null;
  let activeUserForModal = null;

  // DOM Elements
  const tableBody = document.getElementById('users-table-body');
  const emptyState = document.getElementById('empty-state');
  const inputSearch = document.getElementById('input-search');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnOpenRegister = document.getElementById('btn-open-register');
  const btnCloseRegister = document.getElementById('btn-close-register');
  const btnCancelRegister = document.getElementById('btn-cancel-register');
  const modalRegister = document.getElementById('modal-register');
  const formRegister = document.getElementById('form-register-wallet');
  const btnGenRandomWallet = document.getElementById('btn-gen-random-wallet');

  const modalDetails = document.getElementById('modal-details');
  const btnCloseDetails = document.getElementById('btn-close-details');
  const btnCopyModalWallet = document.getElementById('btn-copy-modal-wallet');
  const btnCopyRawJson = document.getElementById('btn-copy-raw-json');
  const btnModalVerify = document.getElementById('btn-modal-verify');
  const btnModalDelete = document.getElementById('btn-modal-delete');

  const btnExportJson = document.getElementById('btn-export-json');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetFilters = document.getElementById('btn-reset-filters');

  // Stats DOM Elements
  const statTotalUsers = document.getElementById('stat-total-users');
  const statVerifiedUsers = document.getElementById('stat-verified-users');
  const statPendingUsers = document.getElementById('stat-pending-users');
  const statTotalLimit = document.getElementById('stat-total-limit');
  const statRecent = document.getElementById('stat-recent');

  const countAll = document.getElementById('count-all');
  const countVerified = document.getElementById('count-verified');
  const countPending = document.getElementById('count-pending');
  const countRejected = document.getElementById('count-rejected');

  // Deterministic avatar gradient generator from string hash
  function generateAvatarGradient(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 75%, 55%), hsl(${h2}, 85%, 45%))`;
  }

  function formatAddressShort(addr) {
    if (!addr || addr.length < 12) return addr || '--';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatRelativeTime(isoDate) {
    if (!isoDate) return '--';
    const date = new Date(isoDate);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '⚠'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }

  function copyToClipboard(text, label = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text).then(() => {
      showToast(label);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(label);
    });
  }

  // Fetch Users & Stats from API
  async function fetchDashboardData(isManual = false) {
    try {
      if (isManual) {
        btnRefresh.classList.add('loading');
      }

      const res = await fetch('/v1/user/list');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      allUsers = data.users || [];
      updateStats(data.stats || {});
      renderTable();

      if (isManual) {
        showToast('Dashboard data refreshed');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      if (isManual) {
        showToast('Failed to refresh data', 'error');
      }
    } finally {
      if (isManual) {
        btnRefresh.classList.remove('loading');
      }
    }
  }

  function updateStats(stats) {
    statTotalUsers.textContent = stats.totalUsers ?? allUsers.length;
    statVerifiedUsers.textContent = stats.verifiedUsers ?? 0;
    statPendingUsers.textContent = stats.pendingUsers ?? 0;
    statRecent.textContent = `${stats.recentRegistrations ?? 0} new`;

    const totalLimit = stats.totalSpendingLimit ?? 0;
    statTotalLimit.textContent = `₹${totalLimit.toLocaleString('en-IN')}`;

    // Filter counts
    countAll.textContent = allUsers.length;
    countVerified.textContent = allUsers.filter(u => u.kyc_status === 'verified').length;
    countPending.textContent = allUsers.filter(u => u.kyc_status === 'pending').length;
    countRejected.textContent = allUsers.filter(u => u.kyc_status === 'rejected').length;
  }

  // Render Table
  function renderTable() {
    const query = searchQuery.toLowerCase().trim();
    const filtered = allUsers.filter(user => {
      // Filter status
      if (currentFilter !== 'all' && user.kyc_status !== currentFilter) {
        return false;
      }
      // Search query
      if (query) {
        const addr = (user.wallet_address || '').toLowerCase();
        const id = (user.id || '').toLowerCase();
        const status = (user.kyc_status || '').toLowerCase();
        return addr.includes(query) || id.includes(query) || status.includes(query);
      }
      return true;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    tableBody.innerHTML = filtered.map(user => {
      const avatarStyle = generateAvatarGradient(user.wallet_address || user.id);
      const shortAddr = formatAddressShort(user.wallet_address);
      const initials = (user.wallet_address || '0x').slice(2, 4).toUpperCase();
      const relativeTime = formatRelativeTime(user.created_at);
      const exactTime = new Date(user.created_at).toLocaleString();

      let badgeClass = 'badge-amber';
      if (user.kyc_status === 'verified') badgeClass = 'badge-emerald';
      if (user.kyc_status === 'rejected') badgeClass = 'badge-rose';

      return `
        <tr data-user-id="${user.id}">
          <td>
            <div class="account-cell">
              <div class="avatar-deterministic" style="background: ${avatarStyle}">${initials}</div>
              <div class="wallet-details">
                <div class="wallet-address-row">
                  <span class="mono address-text" title="${user.wallet_address}">${shortAddr}</span>
                  <button class="btn-inline-copy" onclick="window.crypeApp.copy('${user.wallet_address}', 'Wallet address copied!')" title="Copy full 0x address">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </button>
                </div>
                <span class="tag-label">EVM • Ethereum / Polygon</span>
              </div>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span class="mono text-muted text-sm">${user.id.slice(0, 12)}...</span>
              <button class="btn-inline-copy" onclick="window.crypeApp.copy('${user.id}', 'User ID copied!')" title="Copy User ID">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              </button>
            </div>
          </td>
          <td>
            <span class="badge ${badgeClass}">${user.kyc_status}</span>
          </td>
          <td>
            <span class="text-bold">₹${(user.spending_limit || 0).toLocaleString('en-IN')}</span>
          </td>
          <td>
            <span class="text-muted text-sm" title="${exactTime}">${relativeTime}</span>
          </td>
          <td>
            <div class="table-actions">
              ${user.kyc_status !== 'verified' ? `
                <button class="btn btn-xs btn-emerald" onclick="window.crypeApp.verifyUser('${user.id}')" title="Approve KYC">
                  Verify
                </button>
              ` : ''}
              <button class="btn btn-xs btn-secondary" onclick="window.crypeApp.viewDetails('${user.id}')" title="Inspect user details">
                Inspect
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // View User Details Modal
  function openUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    activeUserForModal = user;

    document.getElementById('modal-user-id-title').textContent = `User: ${user.id.slice(0, 10)}...`;
    document.getElementById('modal-wallet-address').textContent = user.wallet_address;
    document.getElementById('modal-user-id').textContent = user.id;

    const badge = document.getElementById('modal-kyc-badge');
    badge.textContent = user.kyc_status;
    badge.className = `badge ${user.kyc_status === 'verified' ? 'badge-emerald' : user.kyc_status === 'rejected' ? 'badge-rose' : 'badge-amber'}`;

    document.getElementById('modal-spending-limit').textContent = `₹${(user.spending_limit || 0).toLocaleString('en-IN')}`;
    document.getElementById('modal-created-at').textContent = `${new Date(user.created_at).toLocaleString()} (${formatRelativeTime(user.created_at)})`;

    document.getElementById('modal-raw-json').textContent = JSON.stringify(user, null, 2);

    btnModalVerify.style.display = user.kyc_status === 'verified' ? 'none' : 'inline-flex';
    modalDetails.classList.add('open');
  }

  // Verify KYC from UI
  async function verifyUserKYC(userId) {
    try {
      const res = await fetch(`/v1/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kyc_level: 'verified',
          kyc_status: 'verified',
          spending_limit: 50000,
        })
      });
      if (!res.ok) throw new Error('Failed to update KYC');
      showToast('User KYC verified successfully!');
      if (modalDetails.classList.contains('open')) {
        modalDetails.classList.remove('open');
      }
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast('Failed to verify user', 'error');
    }
  }

  // Delete User
  async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user record?')) return;
    try {
      const res = await fetch(`/v1/user/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      showToast('User deleted');
      modalDetails.classList.remove('open');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user', 'error');
    }
  }

  // Register Form Submission
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = document.getElementById('reg-wallet-address').value.trim();
    const chainId = document.getElementById('reg-chain-id').value.trim();
    const method = document.getElementById('reg-method').value.trim();
    const initialKyc = document.getElementById('reg-initial-kyc').value;

    if (!address) {
      showToast('Please enter a wallet address', 'error');
      return;
    }

    try {
      const submitBtn = document.getElementById('btn-submit-register');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering...';

      const res = await fetch('/v1/wallet/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          chainId,
          method,
          timestamp: Date.now()
        })
      });

      if (!res.ok) throw new Error(`Registration failed (${res.status})`);
      const data = await res.json();

      // If initial kyc is verified, auto patch
      if (initialKyc === 'verified' && data.userId) {
        await fetch(`/v1/user/${data.userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kyc_level: 'verified', kyc_status: 'verified', spending_limit: 50000 })
        });
      }

      showToast(`Wallet ${formatAddressShort(address)} registered!`);
      modalRegister.classList.remove('open');
      formRegister.reset();
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast('Failed to register wallet', 'error');
    } finally {
      const submitBtn = document.getElementById('btn-submit-register');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Registration';
    }
  });

  // Random wallet generator for testing
  btnGenRandomWallet.addEventListener('click', () => {
    const chars = '0123456789abcdef';
    let hex = '0x';
    for (let i = 0; i < 40; i++) {
      hex += chars[Math.floor(Math.random() * chars.length)];
    }
    document.getElementById('reg-wallet-address').value = hex;
  });

  // Search input handlers
  inputSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    btnClearSearch.style.display = searchQuery ? 'block' : 'none';
    renderTable();
  });

  btnClearSearch.addEventListener('click', () => {
    inputSearch.value = '';
    searchQuery = '';
    btnClearSearch.style.display = 'none';
    renderTable();
  });

  // Filter handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-status');
      renderTable();
    });
  });

  btnResetFilters.addEventListener('click', () => {
    inputSearch.value = '';
    searchQuery = '';
    btnClearSearch.style.display = 'none';
    currentFilter = 'all';
    filterBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-status') === 'all');
    });
    renderTable();
  });

  // Export handlers
  btnExportJson.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(allUsers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crype-wallets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported to JSON');
  });

  btnExportCsv.addEventListener('click', () => {
    if (allUsers.length === 0) {
      showToast('No data to export', 'error');
      return;
    }
    const headers = ['id', 'wallet_address', 'kyc_level', 'kyc_status', 'spending_limit', 'created_at'];
    const rows = allUsers.map(u => headers.map(h => `"${(u[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crype-wallets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported to CSV');
  });

  // Modal open/close handlers
  btnOpenRegister.addEventListener('click', () => modalRegister.classList.add('open'));
  btnCloseRegister.addEventListener('click', () => modalRegister.classList.remove('open'));
  btnCancelRegister.addEventListener('click', () => modalRegister.classList.remove('open'));

  btnCloseDetails.addEventListener('click', () => modalDetails.classList.remove('open'));
  btnCopyModalWallet.addEventListener('click', () => {
    if (activeUserForModal) copyToClipboard(activeUserForModal.wallet_address, 'Wallet copied!');
  });
  btnCopyRawJson.addEventListener('click', () => {
    if (activeUserForModal) copyToClipboard(JSON.stringify(activeUserForModal, null, 2), 'JSON copied!');
  });
  btnModalVerify.addEventListener('click', () => {
    if (activeUserForModal) verifyUserKYC(activeUserForModal.id);
  });
  btnModalDelete.addEventListener('click', () => {
    if (activeUserForModal) deleteUser(activeUserForModal.id);
  });

  btnRefresh.addEventListener('click', () => fetchDashboardData(true));

  // Global helper namespace for inline HTML event triggers
  window.crypeApp = {
    copy: copyToClipboard,
    viewDetails: openUserDetails,
    verifyUser: verifyUserKYC,
    deleteUser: deleteUser
  };

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalRegister.classList.remove('open');
      modalDetails.classList.remove('open');
    }
  });

  [modalRegister, modalDetails].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Initial load and start 3-second auto-sync
  fetchDashboardData();
  autoSyncInterval = setInterval(fetchDashboardData, 3000);
})();
