export const getCurrentTheme = () => {
  if (localStorage.theme) return localStorage.theme as 'light' | 'dark';

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (prefersDark) {
    return 'system';
  }

  return 'light';
};

export const checkForDarkPreference = () => {
  return (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
};
