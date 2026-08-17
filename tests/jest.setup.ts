// Global Jest setup for AyahNow. jest-expo's preset already wires up the
// React Native / Expo module mocks; this file adds project-specific ones.

// AsyncStorage's official Jest mock (in-memory, resets between tests via jest's module registry).
// jest.mock factories must use require(), not ESM import.
jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// __DEV__ is normally injected by Metro; Jest doesn't define it by default.
(global as unknown as { __DEV__: boolean }).__DEV__ = true;
