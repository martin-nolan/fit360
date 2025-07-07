import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

async function checkPasswordBreached(password: string): Promise<boolean> {
  try {
    // Hash the password with SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Use k-anonymity - only send first 5 characters of hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      console.log('HaveIBeenPwned API error:', response.status);
      return false; // Assume not breached if API fails
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // Check if our hash suffix appears in the results
    for (const line of lines) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix === suffix) {
        return true; // Password is breached
      }
    }
    
    return false; // Password not found in breaches
  } catch (error) {
    console.error('Error checking password breach:', error);
    return false; // Assume not breached if check fails
  }
}

function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Basic length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Character variety checks
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
  
  // Common patterns to avoid
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
    /123456/, // Sequential numbers
    /abcdef/, // Sequential letters
    /qwerty/i, // Common keyboard patterns
    /password/i, // The word "password"
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns that should be avoided');
      break;
    }
  }
  
  // Determine strength
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
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  try {
    const { password } = await req.json();
    
    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('Validating password...');
    
    // Check password strength
    const strengthResult = validatePasswordStrength(password);
    
    // Check if password is breached
    const isBreached = await checkPasswordBreached(password);
    
    const result = {
      ...strengthResult,
      isBreached,
      isValid: strengthResult.isValid && !isBreached
    };
    
    if (isBreached) {
      result.errors.push('This password has been found in data breaches and should not be used');
    }
    
    console.log('Password validation result:', { 
      strength: result.strength, 
      isBreached, 
      errorCount: result.errors.length 
    });
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Password validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});