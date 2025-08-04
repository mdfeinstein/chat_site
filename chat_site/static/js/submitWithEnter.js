
function submitWithEnterListener(formId, listeningElementQuery) {  
  document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById(formId);
  const input = form.querySelector(listeningElementQuery);
  if (input) {
    input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
    });
  }
  });
}