import { describe, expect, it } from 'vitest';
import { dateRange, monthYear } from './dates';

describe('monthYear', () => {
	it('formats YYYY-MM, YYYY and missing values', () => {
		expect(monthYear('2024-08')).toBe('Aug 2024');
		expect(monthYear('2027')).toBe('2027');
		expect(monthYear()).toBe('Present');
	});
});

describe('dateRange', () => {
	it('handles open, year-only and cross-year ranges', () => {
		expect(dateRange('2024-08')).toBe('Aug 2024 – Present');
		expect(dateRange('2023', '2027')).toBe('2023 – 2027');
		expect(dateRange('2023-05', '2024-01')).toBe('May 2023 – Jan 2024');
	});
	it('shortens ranges within one year', () => {
		expect(dateRange('2025-05', '2025-08')).toBe('May – Aug 2025');
		expect(dateRange('2025-05', '2025-05')).toBe('May 2025');
	});
	it('shows nothing, or just the end, without a start', () => {
		expect(dateRange()).toBeNull();
		expect(dateRange(undefined, '2027-05')).toBe('May 2027');
	});
});
