import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

export const healthCheckConfigSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  timeoutMs: z.number().positive().default(5000),
});
