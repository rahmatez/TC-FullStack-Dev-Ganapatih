/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeDisabled(): R
      toHaveClass(className: string): R
      toHaveTextContent(text: string): R
      toBeVisible(): R
      toBeEnabled(): R
      toHaveValue(value: string | number): R
      toHaveAttribute(attr: string, value?: string): R
      toBeChecked(): R
      toBeEmpty(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveStyle(css: string | Record<string, any>): R
    }
  }
}

export {}
