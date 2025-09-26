/**
 * Authentication Modal Provider
 * Provides global authentication modal management using Hybrid Auth
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthModal } from './auth-modal';
import { useAuth } from '../../contexts/hybrid-auth-context';
import { setGlobalAuthModalTrigger } from '../../lib/api-client';

interface AuthModalContextType {
  showAuthModal: (context?: string, onSuccess?: () => void, intendedUrl?: string) => void;
  hideAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

interface AuthModalProviderProps {
  children: React.ReactNode;
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>();
  const [, setIntendedUrlState] = useState<string | undefined>();
  const { user } = useAuth();

  const showAuthModal = useCallback((_context?: string, onSuccess?: () => void, intendedUrl?: string) => {
    setPendingAction(onSuccess ? () => onSuccess : undefined);
    setIntendedUrlState(intendedUrl);
    setIsAuthModalOpen(true);
  }, []);

  const hideAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingAction(undefined);
    setIntendedUrlState(undefined);
  }, []);

  // Close modal and execute pending action when user becomes authenticated
  useEffect(() => {
    if (user && isAuthModalOpen) {
      hideAuthModal();
      // Execute the pending action after a brief delay to ensure modal is closed
      if (pendingAction) {
        setTimeout(() => {
          pendingAction();
        }, 100);
      }
    }
  }, [user, pendingAction, isAuthModalOpen, hideAuthModal]);

  // Set up global auth modal trigger for API client
  useEffect(() => {
    setGlobalAuthModalTrigger(showAuthModal);
  }, [showAuthModal]);

  const value: AuthModalContextType = {
    showAuthModal,
    hideAuthModal,
    isAuthModalOpen,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={hideAuthModal}
      />
    </AuthModalContext.Provider>
  );
}
