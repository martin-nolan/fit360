import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  isBreached?: boolean;
}

export const usePasswordValidation = () => {
  const [validationResult, setValidationResult] = useState<PasswordValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validatePassword = useCallback(async (password: string) => {
    if (!password) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-password', {
        body: { password }
      });

      if (error) {
        console.error('Password validation error:', error);
        // Fallback to basic client-side validation
        const basicValidation = validatePasswordBasic(password);
        setValidationResult(basicValidation);
      } else {
        setValidationResult(data);
      }
    } catch (error) {
      console.error('Password validation error:', error);
      // Fallback to basic client-side validation
      const basicValidation = validatePasswordBasic(password);
      setValidationResult(basicValidation);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Basic client-side validation as fallback
  const validatePasswordBasic = (password: string): PasswordValidationResult => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    
    if (errors.length === 0) {
      if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength = 'strong';
      } else if (password.length >= 10) {
        strength = 'medium';
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  };

  return {
    validationResult,
    isValidating,
    validatePassword
  };
};