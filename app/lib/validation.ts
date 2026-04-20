import { z } from 'zod';

export const issueTitleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
});

export const issueDescriptionSchema = z.object({
  description: z.string().max(5000, 'Description is too long'),
});

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

