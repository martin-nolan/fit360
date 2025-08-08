import * as React from "react";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  isBreached?: boolean;
}

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationResult?: PasswordValidationResult | null;
  isValidating?: boolean;
  showValidation?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, validationResult, isValidating, showValidation = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const getStrengthColor = (strength: string) => {
      switch (strength) {
        case 'weak':
          return 'bg-destructive';
        case 'medium':
          return 'bg-warning';
        case 'strong':
          return 'bg-success';
        default:
          return 'bg-muted';
      }
    };

    const getStrengthWidth = (strength: string) => {
      switch (strength) {
        case 'weak':
          return 'w-1/3';
        case 'medium':
          return 'w-2/3';
        case 'strong':
          return 'w-full';
        default:
          return 'w-0';
      }
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={cn(
              "pr-10",
              validationResult && !validationResult.isValid && showValidation && "border-destructive",
              validationResult && validationResult.isValid && showValidation && "border-success",
              className
            )}
            ref={ref}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {showValidation && validationResult && (
          <div className="space-y-2">
            {/* Password Strength Indicator */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Password strength</span>
                <span className={cn(
                  "font-medium capitalize",
                  validationResult.strength === 'weak' && "text-destructive",
                  validationResult.strength === 'medium' && "text-warning",
                  validationResult.strength === 'strong' && "text-success"
                )}>
                  {isValidating ? 'Checking...' : validationResult.strength}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    getStrengthColor(validationResult.strength),
                    getStrengthWidth(validationResult.strength)
                  )}
                />
              </div>
            </div>

            {/* Validation Messages */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-1">
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-destructive">
                    <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success Message */}
            {validationResult.isValid && !isValidating && (
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="h-3 w-3" />
                <span>Password meets all requirements</span>
              </div>
            )}

            {/* Breach Warning */}
            {validationResult.isBreached && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>This password has been compromised in data breaches. Please choose a different password.</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };