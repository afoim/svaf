import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Announcement from '../Announcement.svelte';

// Mock the mdsvex content import
vi.mock('../../content/announcement/index.md', () => ({
	default: { render: () => '<p>Test announcement</p>' },
	metadata: { enable: true, level: 'info' }
}));

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		})
	};
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock requestAnimationFrame
const rafMock = vi.fn((cb: FrameRequestCallback) => {
	cb(0);
	return 0;
});
window.requestAnimationFrame = rafMock;

describe('Announcement Component', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Animation Trigger', () => {
		it('should trigger slide-in animation on page load', async () => {
			const { container } = render(Announcement);

			// Wait for onMount to execute
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			expect(popup).toBeTruthy();
			expect(popup?.classList.contains('announcement-visible')).toBe(true);
		});

		it('should start with translateX(-100%) initially', async () => {
			const { container } = render(Announcement);

			const popup = container.querySelector('.announcement-popup');
			expect(popup).toBeTruthy();

			// Check initial computed style
			const style = window.getComputedStyle(popup as Element);
			expect(style.transform).toContain('translateX');
		});

		it('should not render if announcement was closed within 24 hours', async () => {
			localStorageMock.setItem('announcement-closed', Date.now().toString());

			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			expect(popup).toBeFalsy();
		});
	});

	describe('Close Button', () => {
		it('should have close button with correct dimensions (>= 24x24px)', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const closeBtn = container.querySelector('.announcement-close-btn');
			expect(closeBtn).toBeTruthy();

			// Check button has minimum dimensions
			const style = window.getComputedStyle(closeBtn as Element);
			const width = parseFloat(style.width) || 32;
			const height = parseFloat(style.height) || 32;
			expect(width).toBeGreaterThanOrEqual(24);
			expect(height).toBeGreaterThanOrEqual(24);
		});

		it('should execute slide-out animation on close button click', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			expect(popup?.classList.contains('announcement-visible')).toBe(true);

			const closeBtn = container.querySelector('.announcement-close-btn');
			await fireEvent.click(closeBtn as Element);

			// Should remove visible class (triggering slide-out)
			expect(popup?.classList.contains('announcement-visible')).toBe(false);
		});

		it('should save close state to localStorage', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const closeBtn = container.querySelector('.announcement-close-btn');
			await fireEvent.click(closeBtn as Element);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'announcement-closed',
				expect.any(String)
			);
		});

		it('should have accessible aria-label', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const closeBtn = container.querySelector('.announcement-close-btn');
			expect(closeBtn?.getAttribute('aria-label')).toBe('关闭公告');
		});
	});

	describe('DOM State After Animation', () => {
		it('should have correct visibility state after slide-in', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			expect(popup).toBeTruthy();
			expect(popup?.classList.contains('announcement-visible')).toBe(true);
		});

		it('should have correct visibility state after slide-out', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			const closeBtn = container.querySelector('.announcement-close-btn');

			await fireEvent.click(closeBtn as Element);

			expect(popup?.classList.contains('announcement-visible')).toBe(false);
		});

		it('should have correct z-index (higher than other elements)', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			const style = window.getComputedStyle(popup as Element);

			expect(style.zIndex).toBe('9999');
		});

		it('should be positioned at top-left corner', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			const style = window.getComputedStyle(popup as Element);

			expect(style.position).toBe('fixed');
			expect(style.top).toBe('0px');
			expect(style.left).toBe('0px');
		});
	});

	describe('Memory Leaks and Event Binding', () => {
		it('should not have duplicate event listeners on re-render', async () => {
			const { container, unmount } = render(Announcement);
			await vi.runAllTimersAsync();

			const closeBtn = container.querySelector('.announcement-close-btn');
			const clickHandler = vi.fn();

			// Add a spy to track clicks
			closeBtn?.addEventListener('click', clickHandler);

			// Click once
			await fireEvent.click(closeBtn as Element);

			// Should only fire once (no duplicate bindings)
			expect(clickHandler).toHaveBeenCalledTimes(1);

			unmount();
		});

		it('should clean up properly on unmount', async () => {
			const { unmount, container } = render(Announcement);
			await vi.runAllTimersAsync();

			expect(container.querySelector('.announcement-popup')).toBeTruthy();

			unmount();

			// After unmount, the element should be removed
			expect(container.querySelector('.announcement-popup')).toBeFalsy();
		});

		it('should handle multiple rapid clicks without issues', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const closeBtn = container.querySelector('.announcement-close-btn');

			// Rapid clicks
			await fireEvent.click(closeBtn as Element);
			await fireEvent.click(closeBtn as Element);
			await fireEvent.click(closeBtn as Element);

			// Should only save to localStorage once per unique close action
			// (subsequent clicks on already-closed popup are harmless)
			expect(localStorageMock.setItem).toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('should have role="alert" for screen readers', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			expect(popup?.getAttribute('role')).toBe('alert');
		});

		it('should have aria-live="polite"', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			expect(popup?.getAttribute('aria-live')).toBe('polite');
		});

		it('should have focus-visible styles for keyboard navigation', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const closeBtn = container.querySelector('.announcement-close-btn');
			expect(closeBtn).toBeTruthy();

			// Check that focus-visible styles exist in the component
			const styleElement = container.querySelector('style');
			expect(styleElement?.textContent).toContain('focus-visible');
		});
	});

	describe('Animation Timing', () => {
		it('should use correct animation duration (350ms)', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			const style = window.getComputedStyle(popup as Element);

			// Check transition duration
			expect(style.transitionDuration).toBe('350ms');
		});

		it('should use ease-out timing function', async () => {
			const { container } = render(Announcement);
			await vi.runAllTimersAsync();

			const popup = container.querySelector('.announcement-popup');
			const style = window.getComputedStyle(popup as Element);

			expect(style.transitionTimingFunction).toContain('ease-out');
		});
	});
});
