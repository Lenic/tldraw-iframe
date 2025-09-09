import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ReactNode } from 'react';

export type PortalProps = {
  children: ReactNode;
  /**
   * Optional ID of a pre-existing element to use as the portal's container.
   * If not provided, a new div will be created and appended to the body.
   */
  containerId?: string;
  /**
   * Delays mounting the portal until after the initial render.
   * This is useful for Server-Side Rendering (SSR) environments to avoid
   * mismatches between the server and client DOM.
   * @default true
   */
  deferMount?: boolean;
};

// This helps create unique IDs if multiple portals are used without a specific containerId.
let increasedId = 0;

export function Portal({ children, containerId, deferMount = true }: PortalProps) {
  // State to track if the component is mounted on the client.
  // This is the core of the SSR-safe mounting strategy.
  const [mounted, setMounted] = useState(!deferMount);

  // State to hold the DOM element that will act as the portal container.
  // Using state ensures that the component re-renders when the container is ready.
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // This effect runs only on the client-side after the initial render.
    // It sets `mounted` to true, triggering a re-render to actually show the portal.
    if (deferMount) {
      setMounted(true);
    }
  }, [deferMount]);

  useEffect(() => {
    // This effect is responsible for all DOM manipulation.
    // It finds or creates the container element for the portal.
    if (typeof document !== 'undefined') {
      const existingContainer = containerId ? document.getElementById(containerId) : null;
      let newContainer: HTMLElement | null = null;

      if (existingContainer) {
        // A container with the given ID already exists. Use it.
        setContainer(existingContainer);
      } else {
        // No existing container found, so we create a new one.
        increasedId += 1;
        newContainer = document.createElement('div');
        newContainer.id = containerId || `portal-container-${increasedId}`;
        document.body.appendChild(newContainer);
        setContainer(newContainer);
      }

      // This is the cleanup function. It's crucial.
      // It runs when the Portal component is unmounted.
      return () => {
        // We only remove the container if we created it ourselves.
        // If a `containerId` was provided, we assume the element is managed elsewhere
        // and should not be removed by this component.
        if (newContainer && !containerId) {
          newContainer.parentElement?.removeChild(newContainer);
        }
      };
    }
  }, [containerId]); // This effect re-runs if the containerId prop changes.

  // Render null if we are on the server, or if the container element is not yet available.
  if (!mounted || !container) {
    return null;
  }

  // Once mounted on the client and the container is ready, create the portal.
  return createPortal(children, container);
}
