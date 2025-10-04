import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders landing page', () => {
  render(<App />);
  const heading = screen.getByText(/Sign Language Translator/i);
  expect(heading).toBeInTheDocument();
});

test('starts translator on button click', () => {
  render(<App />);
  const startButton = screen.getByText(/Start Translating/i);
  fireEvent.click(startButton);
  const translatorInterface = screen.getByText(/Translator/i);
  expect(translatorInterface).toBeInTheDocument();
});

test('toggles dark mode', () => {
  render(<App />);
  const darkModeButton = screen.getByLabelText(/Toggle dark mode/i);
  fireEvent.click(darkModeButton);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});