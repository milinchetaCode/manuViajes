// Admin Panel JavaScript
// Handles add package and delete package functionality

document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin panel script loaded');

  var btnAddPackage = document.getElementById('btn-add-package');
  var packagesContainer = document.getElementById('packages-container');
  var template = document.getElementById('package-card-template');

  console.log('Button:', btnAddPackage);
  console.log('Container:', packagesContainer);
  console.log('Template:', template);

  if (!btnAddPackage || !packagesContainer || !template) {
    console.error('Required elements missing!');
    console.error('Button exists:', !!btnAddPackage);
    console.error('Container exists:', !!packagesContainer);
    console.error('Template exists:', !!template);
    return;
  }

  // Add package button - creates package in backend first
  btnAddPackage.addEventListener('click', function() {
    console.log('Add package button clicked!');
    
    // Disable button to prevent double-clicks
    btnAddPackage.disabled = true;
    btnAddPackage.innerHTML = 'Creando...';

    // Call backend to create package with UUID
    fetch('/admin/panel/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(function(response) {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Error creating package: ' + response.status);
      }
      return response.json();
    })
    .then(function(newPackage) {
      console.log('New package created:', newPackage);

      // Use template content and replace placeholder with real UUID
      var content = template.innerHTML;
      // Replace all occurrences of __ID__
      content = content.split('__ID__').join(newPackage.id);

      // Create element and add to container
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = content.trim();
      var newCard = tempDiv.firstElementChild;
      
      if (!newCard) {
        console.error('Failed to create new card element');
        throw new Error('Failed to create card');
      }

      // Update the card with the package data
      var eventNameInput = newCard.querySelector('input[name="paquetes[' + newPackage.id + '][eventName]"]');
      if (eventNameInput) {
        eventNameInput.value = newPackage.eventName || 'Nuevo Paquete';
      }

      // Add continent input
      var continentInput = newCard.querySelector('input[name="paquetes[' + newPackage.id + '][continent]"]');
      if (continentInput) {
        continentInput.value = newPackage.continent || '';
      }

      packagesContainer.appendChild(newCard);
      console.log('New package card added successfully');

      // Scroll to new card
      newCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
      
      // Re-enable button
      btnAddPackage.disabled = false;
      btnAddPackage.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar Nuevo Paquete';
    })
    .catch(function(error) {
      console.error('Error creating package:', error);
      alert('Error al crear el paquete: ' + error.message + '\n\nPor favor, intente de nuevo.');
      
      // Re-enable button
      btnAddPackage.disabled = false;
      btnAddPackage.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar Nuevo Paquete';
    });
  });

  // Delete package event (delegated) - now calls backend
  packagesContainer.addEventListener('click', function(e) {
    var deleteBtn = e.target.closest('.btn-delete-package');
    if (!deleteBtn) return;
    
    console.log('Delete button clicked');
    
    var card = deleteBtn.closest('.package-card');
    if (!card) {
      console.error('Card not found');
      return;
    }
    
    var packageId = card.getAttribute('data-package-id');
    console.log('Package ID:', packageId);
    
    // Get package name for confirmation message
    var eventNameInput = card.querySelector('input[name*="[eventName]"]');
    var packageName = eventNameInput ? eventNameInput.value : packageId;
    
    var confirmDelete = confirm('¿Está seguro de que desea eliminar el paquete "' + packageName + '"?\n\nEsta acción no se puede deshacer.');
    
    if (!confirmDelete) {
      console.log('Delete cancelled by user');
      return;
    }

    // Disable delete button to prevent double-clicks
    deleteBtn.disabled = true;
    deleteBtn.style.opacity = '0.5';

    // Call backend to delete package
    fetch('/admin/panel/delete/' + packageId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(function(response) {
      console.log('Delete response status:', response.status);
      if (!response.ok) {
        throw new Error('Error deleting package: ' + response.status);
      }
      return response;
    })
    .then(function() {
      console.log('Package deleted successfully:', packageId);
      
      // Remove card from DOM with animation
      card.style.transition = 'opacity 0.3s ease-out';
      card.style.opacity = '0';
      setTimeout(function() {
        card.remove();
        console.log('Card removed from DOM');
      }, 300);
    })
    .catch(function(error) {
      console.error('Error deleting package:', error);
      alert('Error al eliminar el paquete: ' + error.message + '\n\nPor favor, intente de nuevo.');
      
      // Re-enable button on error
      deleteBtn.disabled = false;
      deleteBtn.style.opacity = '1';
    });
  });
  
  console.log('Event listeners attached successfully');
});
