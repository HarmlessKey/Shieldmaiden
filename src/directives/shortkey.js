// Lightweight Vue 3 keyboard shortcut directive
// Replicates vue-shortkey behavior

function keyMatchesShortcut(event, keys) {
  const pressed = [];
  if (event.ctrlKey) pressed.push('ctrl');
  if (event.shiftKey) pressed.push('shift');
  if (event.altKey) pressed.push('alt');

  // Normalize key names
  const keyName = event.key.toLowerCase();
  const keyMap = {
    'escape': 'esc',
    'arrowleft': 'arrowleft',
    'arrowright': 'arrowright',
    'arrowup': 'arrowup',
    'arrowdown': 'arrowdown',
  };
  pressed.push(keyMap[keyName] || keyName);

  if (keys.length !== pressed.length) return false;
  return keys.every(k => pressed.includes(k.toLowerCase()));
}

function shouldPrevent(event) {
  const tag = event.target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || event.target.isContentEditable;
}

const handlers = new WeakMap();

export const shortkey = {
  mounted(el, binding) {
    let shortcuts;
    const value = binding.value;

    if (Array.isArray(value)) {
      shortcuts = { default: value };
    } else if (typeof value === 'object' && value !== null) {
      shortcuts = value;
    } else {
      return;
    }

    const handler = (event) => {
      if (shouldPrevent(event)) return;
      for (const [name, keys] of Object.entries(shortcuts)) {
        if (keyMatchesShortcut(event, keys)) {
          event.preventDefault();
          el.dispatchEvent(new CustomEvent('shortkey', { detail: { srcKey: name } }));
        }
      }
    };

    handlers.set(el, handler);
    window.addEventListener('keydown', handler);
  },
  unmounted(el) {
    const handler = handlers.get(el);
    if (handler) {
      window.removeEventListener('keydown', handler);
      handlers.delete(el);
    }
  },
};

export default {
  install(app) {
    app.directive('shortkey', shortkey);
  },
};
