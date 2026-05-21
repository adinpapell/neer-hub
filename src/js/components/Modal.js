/**
 * Modal — Reusable modal dialog component.
 * Usage: Modal.open({ title, content, onSave, onDelete })
 */
export class Modal {
  static open({ title, content, onSave, onDelete, saveLabel = 'Save' }) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');

    container.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer">
        ${onDelete ? '<button class="btn btn-danger" id="modal-delete-btn">Delete</button>' : ''}
        <div style="flex:1"></div>
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">${saveLabel}</button>
      </div>
    `;

    overlay.classList.add('active');
    container.classList.add('active');

    // Focus first input
    const firstInput = container.querySelector('input, select, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);

    // Close handlers
    const close = () => {
      overlay.classList.remove('active');
      container.classList.remove('active');
    };

    document.getElementById('modal-close-btn').addEventListener('click', close);
    document.getElementById('modal-cancel-btn').addEventListener('click', close);
    overlay.addEventListener('click', close);

    // Save handler
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (onSave) onSave(close);
    });

    // Delete handler
    if (onDelete) {
      document.getElementById('modal-delete-btn').addEventListener('click', () => {
        if (onDelete) onDelete(close);
      });
    }

    return { close };
  }

  static close() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('modal-container').classList.remove('active');
  }
}
