import { useCallback, useState } from "react";
import type { ZodError, ZodSchema } from "zod";

interface ValidationResult {
	errors: Record<string, string>;
	isValid: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
	schema: ZodSchema<T>,
) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = useCallback(
		(data: T): ValidationResult => {
			const result = schema.safeParse(data);
			if (result.success) {
				setErrors({});
				return { errors: {}, isValid: true };
			}
			const fieldErrors: Record<string, string> = {};
			const zodError = result.error as ZodError;
			for (const issue of zodError.issues) {
				const path = issue.path.join(".");
				if (!fieldErrors[path]) {
					fieldErrors[path] = issue.message;
				}
			}
			setErrors(fieldErrors);
			return { errors: fieldErrors, isValid: false };
		},
		[schema],
	);

	const clearErrors = useCallback(() => setErrors({}), []);

	const getError = useCallback(
		(field: string): string | undefined => {
			return errors[field];
		},
		[errors],
	);

	return { errors, validate, clearErrors, getError };
}
