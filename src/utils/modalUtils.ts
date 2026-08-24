import React from 'react';

/**
 * Creates safe backdrop click handlers that prevent closing modals
 * when selecting text inside the modal and releasing the mouse on the backdrop.
 * 
 * Standard browsers fire a 'click' event on the common ancestor (the backdrop)
 * when mousedown starts on an element inside the modal and mouseup ends on the backdrop.
 * This helper ensures that dismissal ONLY happens when BOTH mousedown AND mouseup
 * occur directly on the backdrop element.
 */
export function handleBackdropMouseDown(e: React.MouseEvent<HTMLElement>) {
  if (e.target === e.currentTarget) {
    e.currentTarget.dataset.backdropDown = 'true';
  } else {
    delete e.currentTarget.dataset.backdropDown;
  }
}

export function handleBackdropMouseUp(e: React.MouseEvent<HTMLElement>, onClose?: () => void) {
  if (e.currentTarget.dataset.backdropDown === 'true' && e.target === e.currentTarget) {
    if (onClose) {
      onClose();
    }
  }
  delete e.currentTarget.dataset.backdropDown;
}

export function safeBackdropProps(onClose?: () => void) {
  return {
    onMouseDown: handleBackdropMouseDown,
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => handleBackdropMouseUp(e, onClose),
  };
}
