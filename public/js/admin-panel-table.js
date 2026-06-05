// Admin Panel Table JavaScript
// Handles table display, search, pagination, and CRUD operations

(function() {
  'use strict';

  // Load packages data from embedded script tag
  function loadPackagesData() {
    try {
      var dataScript = document.getElementById('packages-data');
      if (dataScript && dataScript.textContent) {
        return JSON.parse(dataScript.textContent);
      }
    } catch (e) {
      console.error('Error parsing packages data:', e);
    }
    return [];
  }

  // State
  var state = {
    packages: loadPackagesData(),
    filteredPackages: [],
    currentPage: 1,
    itemsPerPage: 20,
    searchTerm: '',
    filterVisible: 'all',
    changes: {},
    selectedPackages: new Set()
  };

  // DOM Elements
  var elements = {
    tbody: document.getElementById('packages-tbody'),
    searchInput: document.getElementById('search-input'),
    filterVisible: document.getElementById('filter-visible'),
    btnAddPackage: document.getElementById('btn-add-package'),
    btnSaveAll: document.getElementById('btn-save-all'),
    selectAll: document.getElementById('select-all'),
    paginationContainer: document.getElementById('pagination-container'),
    emptyState: document.getElementById('empty-state'),
    totalCount: document.getElementById('total-count'),
    visibleCount: document.getElementById('visible-count'),
    hiddenCount: document.getElementById('hidden-count'),
    changesCount: document.getElementById('changes-count'),
    editModal: document.getElementById('edit-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalContent: document.getElementById('modal-content'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    btnSaveModal: document.getElementById('btn-save-modal')
  };

  // Initialize
  function init() {
    console.log('Admin panel table initialized with', state.packages.length, 'packages');
    
    // Bind events
    elements.searchInput.addEventListener('input', handleSearch);
    elements.filterVisible.addEventListener('change', handleFilter);
    elements.btnAddPackage.addEventListener('click', handleAddPackage);
    elements.btnSaveAll.addEventListener('click', handleSaveAll);
    elements.selectAll.addEventListener('change', handleSelectAll);
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnCancelModal.addEventListener('click', closeModal);
    elements.btnSaveModal.addEventListener('click', handleSaveModal);
    
    // Close modal on background click
    elements.editModal.addEventListener('click', function(e) {
      if (e.target === elements.editModal) {
        closeModal();
      }
    });
    
    // Initial render
    filterAndRender();
    updateStats();
  }

  // Filter packages based on search and visibility
  function filterPackages() {
    var filtered = state.packages.filter(function(pkg) {
      // Search filter
      var matchesSearch = true;
      if (state.searchTerm) {
        var term = state.searchTerm.toLowerCase();
        matchesSearch = (
          (pkg.eventName || '').toLowerCase().includes(term) ||
          (pkg.ticketPrice || '').toLowerCase().includes(term) ||
          (pkg.availabilityDates || '').toLowerCase().includes(term)
        );
      }
      
      // Visibility filter
      var matchesVisible = true;
      if (state.filterVisible === 'visible') {
        matchesVisible = pkg.visible === true;
      } else if (state.filterVisible === 'hidden') {
        matchesVisible = pkg.visible === false;
      }
      
      return matchesSearch && matchesVisible;
    });
    
    state.filteredPackages = filtered;
    state.currentPage = 1; // Reset to first page
  }

  // Render table
  function renderTable() {
    var startIndex = (state.currentPage - 1) * state.itemsPerPage;
    var endIndex = startIndex + state.itemsPerPage;
    var pagePackages = state.filteredPackages.slice(startIndex, endIndex);
    
    if (pagePackages.length === 0) {
      elements.tbody.innerHTML = '';
      elements.emptyState.classList.remove('hidden');
      elements.paginationContainer.innerHTML = '';
      return;
    }
    
    elements.emptyState.classList.add('hidden');
    
    var html = '';
    pagePackages.forEach(function(pkg) {
      html += renderPackageRow(pkg);
    });
    
    elements.tbody.innerHTML = html;
    
    // Attach event listeners to new rows
    attachRowEventListeners();
    
    // Render pagination
    renderPagination();
  }

  // Render a single package row
  function renderPackageRow(pkg) {
    var visibleBadge = pkg.visible 
      ? '<span class="badge badge-visible">Visible</span>'
      : '<span class="badge badge-hidden">Oculto</span>';
    
    var photoThumb = pkg.photoUrl 
      ? '<img src="' + pkg.photoUrl + '" alt="thumb" class="w-12 h-12 object-cover rounded border border-gray-300"/>'
      : '<div class="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-xs">Sin foto</div>';
    
    return '<tr data-package-id="' + pkg.id + '" class="package-row">' +
      '<td><input type="checkbox" class="row-checkbox rounded border-gray-300 text-accent focus:ring-accent" data-id="' + pkg.id + '"/></td>' +
      '<td>' + visibleBadge + '</td>' +
      '<td class="font-medium text-gray-900">' + (pkg.eventName || '') + '</td>' +
      '<td>' + (pkg.ticketPrice || '') + '</td>' +
      '<td class="text-sm text-gray-600">' + (pkg.availabilityDates || '') + '</td>' +
      '<td>' + photoThumb + '</td>' +
      '<td>' +
        '<div class="flex gap-2">' +
          '<button type="button" class="btn-edit-package text-blue-600 hover:text-blue-800 p-1" title="Editar" data-id="' + pkg.id + '">' +
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>' +
            '</svg>' +
          '</button>' +
          '<button type="button" class="btn-toggle-visible text-gray-600 hover:text-gray-800 p-1" title="' + (pkg.visible ? 'Ocultar' : 'Mostrar') + '" data-id="' + pkg.id + '">' +
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              (pkg.visible 
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>') +
            '</svg>' +
          '</button>' +
          '<button type="button" class="btn-delete-package text-red-600 hover:text-red-800 p-1" title="Eliminar" data-id="' + pkg.id + '">' +
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }

  // Attach event listeners to table rows
  function attachRowEventListeners() {
    // Edit buttons
    var editBtns = document.querySelectorAll('.btn-edit-package');
    editBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        openEditModal(id);
      });
    });
    
    // Toggle visible buttons
    var toggleBtns = document.querySelectorAll('.btn-toggle-visible');
    toggleBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        toggleVisible(id);
      });
    });
    
    // Delete buttons
    var deleteBtns = document.querySelectorAll('.btn-delete-package');
    deleteBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        deletePackage(id);
      });
    });
    
    // Checkboxes
    var checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(function(cb) {
      cb.addEventListener('change', function() {
        var id = this.getAttribute('data-id');
        if (this.checked) {
          state.selectedPackages.add(id);
        } else {
          state.selectedPackages.delete(id);
        }
        updateSelectAllCheckbox();
      });
    });
  }

  // Render pagination
  function renderPagination() {
    var totalPages = Math.ceil(state.filteredPackages.length / state.itemsPerPage);
    
    if (totalPages <= 1) {
      elements.paginationContainer.innerHTML = '<span class="text-sm text-gray-600">Mostrando ' + state.filteredPackages.length + ' paquetes</span>';
      return;
    }
    
    var html = '';
    
    // Previous button
    html += '<button class="pagination-btn" data-page="prev" ' + (state.currentPage === 1 ? 'disabled' : '') + '>Anterior</button>';
    
    // Page numbers
    var startPage = Math.max(1, state.currentPage - 2);
    var endPage = Math.min(totalPages, state.currentPage + 2);
    
    if (startPage > 1) {
      html += '<button class="pagination-btn" data-page="1">1</button>';
      if (startPage > 2) {
        html += '<span class="px-2">...</span>';
      }
    }
    
    for (var i = startPage; i <= endPage; i++) {
      html += '<button class="pagination-btn ' + (i === state.currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += '<span class="px-2">...</span>';
      }
      html += '<button class="pagination-btn" data-page="' + totalPages + '">' + totalPages + '</button>';
    }
    
    // Next button
    html += '<button class="pagination-btn" data-page="next" ' + (state.currentPage === totalPages ? 'disabled' : '') + '>Siguiente</button>';
    
    elements.paginationContainer.innerHTML = html;
    
    // Attach pagination event listeners
    var paginationBtns = document.querySelectorAll('.pagination-btn');
    paginationBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var page = this.getAttribute('data-page');
        if (page === 'prev') {
          state.currentPage = Math.max(1, state.currentPage - 1);
        } else if (page === 'next') {
          state.currentPage = Math.min(totalPages, state.currentPage + 1);
        } else {
          state.currentPage = parseInt(page);
        }
        renderTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // Update statistics
  function updateStats() {
    var total = state.packages.length;
    var visible = state.packages.filter(function(p) { return p.visible; }).length;
    var hidden = total - visible;
    
    elements.totalCount.textContent = total;
    elements.visibleCount.textContent = visible;
    elements.hiddenCount.textContent = hidden;
    elements.changesCount.textContent = Object.keys(state.changes).length;
  }

  // Event Handlers
  function handleSearch(e) {
    state.searchTerm = e.target.value;
    filterAndRender();
  }

  function handleFilter(e) {
    state.filterVisible = e.target.value;
    filterAndRender();
  }

  function filterAndRender() {
    filterPackages();
    renderTable();
  }

  function handleSelectAll(e) {
    var checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(function(cb) {
      cb.checked = e.target.checked;
      var id = cb.getAttribute('data-id');
      if (e.target.checked) {
        state.selectedPackages.add(id);
      } else {
        state.selectedPackages.delete(id);
      }
    });
  }

  function updateSelectAllCheckbox() {
    var checkboxes = document.querySelectorAll('.row-checkbox');
    var allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(function(cb) { return cb.checked; });
    elements.selectAll.checked = allChecked;
  }

  function handleAddPackage() {
    console.log('Add package clicked');
    elements.btnAddPackage.disabled = true;
    elements.btnAddPackage.innerHTML = 'Creando...';
    
    fetch('/admin/panel/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Error creating package');
      return response.json();
    })
    .then(function(newPackage) {
      console.log('Package created:', newPackage);
      state.packages.unshift(newPackage);
      filterAndRender();
      updateStats();
      
      // Open edit modal for new package
      openEditModal(newPackage.id);
      
      elements.btnAddPackage.disabled = false;
      elements.btnAddPackage.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar Paquete';
    })
    .catch(function(error) {
      console.error('Error:', error);
      alert('Error al crear el paquete: ' + error.message);
      elements.btnAddPackage.disabled = false;
      elements.btnAddPackage.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar Paquete';
    });
  }

  function toggleVisible(id) {
    var pkg = state.packages.find(function(p) { return p.id === id; });
    if (!pkg) return;
    
    pkg.visible = !pkg.visible;
    state.changes[id] = pkg;
    
    filterAndRender();
    updateStats();
  }

  function deletePackage(id) {
    var pkg = state.packages.find(function(p) { return p.id === id; });
    if (!pkg) return;
    
    if (!confirm('¿Está seguro de que desea eliminar el paquete "' + pkg.eventName + '"?\n\nEsta acción no se puede deshacer.')) {
      return;
    }
    
    fetch('/admin/panel/delete/' + id, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Error deleting package');
      
      // Remove from state
      state.packages = state.packages.filter(function(p) { return p.id !== id; });
      delete state.changes[id];
      
      filterAndRender();
      updateStats();
      
      console.log('Package deleted:', id);
    })
    .catch(function(error) {
      console.error('Error:', error);
      alert('Error al eliminar el paquete: ' + error.message);
    });
  }

  function handleSaveAll() {
    var changedIds = Object.keys(state.changes);
    if (changedIds.length === 0) {
      alert('No hay cambios para guardar');
      return;
    }
    
    elements.btnSaveAll.disabled = true;
    elements.btnSaveAll.innerHTML = 'Guardando...';
    
    // Prepare data for backend
    var paquetes = {};
    changedIds.forEach(function(id) {
      paquetes[id] = state.changes[id];
    });
    
    fetch('/admin/panel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'paquetes=' + encodeURIComponent(JSON.stringify(paquetes))
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Error saving changes');
      
      // Clear changes
      state.changes = {};
      updateStats();
      
      alert('Cambios guardados correctamente');
      
      elements.btnSaveAll.disabled = false;
      elements.btnSaveAll.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg> Guardar Cambios';
    })
    .catch(function(error) {
      console.error('Error:', error);
      alert('Error al guardar cambios: ' + error.message);
      elements.btnSaveAll.disabled = false;
      elements.btnSaveAll.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg> Guardar Cambios';
    });
  }

  // Modal functions
  var currentEditingId = null;

  function openEditModal(id) {
    var pkg = state.packages.find(function(p) { return p.id === id; });
    if (!pkg) return;
    
    currentEditingId = id;
    elements.modalTitle.textContent = 'Editar Paquete: ' + (pkg.eventName || 'Nuevo Paquete');
    
    // Build form
    var form = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
      '<div class="md:col-span-2">' +
        '<label class="block mb-1 font-semibold">Nombre del Evento</label>' +
        '<input type="text" id="edit-eventName" value="' + (pkg.eventName || '') + '" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"/>' +
      '</div>' +
      '<div>' +
        '<label class="block mb-1 font-semibold">Precio</label>' +
        '<input type="text" id="edit-ticketPrice" value="' + (pkg.ticketPrice || '') + '" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"/>' +
      '</div>' +
      '<div>' +
        '<label class="block mb-1 font-semibold">Fechas Disponibles</label>' +
        '<input type="text" id="edit-availabilityDates" value="' + (pkg.availabilityDates || '') + '" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"/>' +
      '</div>' +
      '<div class="md:col-span-2">' +
        '<label class="block mb-1 font-semibold">Información Vuelo</label>' +
        '<textarea id="edit-flightInfo" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none resize-y">' + (pkg.flightInfo || '') + '</textarea>' +
      '</div>' +
      '<div class="md:col-span-2">' +
        '<label class="block mb-1 font-semibold">Información Hotel</label>' +
        '<textarea id="edit-hotelInfo" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none resize-y">' + (pkg.hotelInfo || '') + '</textarea>' +
      '</div>' +
      '<div class="md:col-span-2">' +
        '<label class="block mb-1 font-semibold">Descripción</label>' +
        '<textarea id="edit-description" rows="5" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none resize-y">' + (pkg.description || '') + '</textarea>' +
      '</div>' +
      '<div class="md:col-span-2">' +
        '<label class="block mb-1 font-semibold">URL de Imagen</label>' +
        '<input type="url" id="edit-photoUrl" value="' + (pkg.photoUrl || '') + '" placeholder="https://example.com/imagen.jpg" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"/>' +
        (pkg.photoUrl ? '<img src="' + pkg.photoUrl + '" alt="preview" class="mt-2 w-32 h-32 object-cover rounded border border-gray-300"/>' : '') +
      '</div>' +
      '<div class="md:col-span-2">' +
        '<label class="flex items-center gap-2">' +
          '<input type="checkbox" id="edit-visible" ' + (pkg.visible ? 'checked' : '') + ' class="rounded border-gray-300 text-accent focus:ring-accent"/>' +
          '<span class="font-semibold">Visible en el sitio web</span>' +
        '</label>' +
      '</div>' +
    '</div>';
    
    elements.modalContent.innerHTML = form;
    elements.editModal.classList.remove('hidden');
    elements.editModal.classList.add('flex');
  }

  function closeModal() {
    elements.editModal.classList.add('hidden');
    elements.editModal.classList.remove('flex');
    currentEditingId = null;
  }

  function handleSaveModal() {
    if (!currentEditingId) return;
    
    var pkg = state.packages.find(function(p) { return p.id === currentEditingId; });
    if (!pkg) return;
    
    // Get form values
    pkg.eventName = document.getElementById('edit-eventName').value;
    pkg.ticketPrice = document.getElementById('edit-ticketPrice').value;
    pkg.availabilityDates = document.getElementById('edit-availabilityDates').value;
    pkg.flightInfo = document.getElementById('edit-flightInfo').value;
    pkg.hotelInfo = document.getElementById('edit-hotelInfo').value;
    pkg.description = document.getElementById('edit-description').value;
    pkg.photoUrl = document.getElementById('edit-photoUrl').value;
    pkg.visible = document.getElementById('edit-visible').checked;
    
    // Mark as changed
    state.changes[currentEditingId] = pkg;
    
    // Update UI
    filterAndRender();
    updateStats();
    closeModal();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
