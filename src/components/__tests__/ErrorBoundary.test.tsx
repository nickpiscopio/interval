import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import {
  log as firebaseLog,
  recordError as firebaseRecordError,
} from "@react-native-firebase/crashlytics";
import ErrorBoundary from "../ErrorBoundary";
import { setLocale } from "../../i18n";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Render crash");
  }
  return <Text testID="healthy-child">All good</Text>;
}

describe("ErrorBoundary", () => {
  const originalDev = (global as any).__DEV__;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__DEV__ = false;
    setLocale("en");
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
    setLocale("en");
    consoleErrorSpy.mockRestore();
  });

  it("renders children normally when no error is thrown", () => {
    const { getByTestId, queryByTestId } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByTestId("healthy-child")).toBeTruthy();
    expect(queryByTestId("error-boundary-fallback")).toBeNull();
    expect(firebaseRecordError).not.toHaveBeenCalled();
  });

  it("catches render errors, records to Crashlytics, and shows localized fallback", () => {
    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByTestId("error-boundary-fallback")).toBeTruthy();
    expect(getByText("Something went wrong")).toBeTruthy();
    expect(getByText("Try Again")).toBeTruthy();

    expect(firebaseLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("ErrorBoundary:")
    );
    expect(firebaseRecordError).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ message: "Render crash" }),
      "ErrorBoundary"
    );
  });

  it("resets error state and renders children when Try Again is pressed", () => {
    let shouldThrow = true;
    const ControlledChild = () => <Bomb shouldThrow={shouldThrow} />;

    const { getByTestId, queryByTestId } = render(
      <ErrorBoundary>
        <ControlledChild />
      </ErrorBoundary>
    );

    expect(getByTestId("error-boundary-fallback")).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(getByTestId("error-boundary-retry-button"));

    expect(queryByTestId("error-boundary-fallback")).toBeNull();
    expect(getByTestId("healthy-child")).toBeTruthy();
  });

  it("renders localized Spanish copy when locale is es", () => {
    setLocale("es");

    const { getByText } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText("Algo salió mal")).toBeTruthy();
    expect(getByText("Intentar de nuevo")).toBeTruthy();
  });
});
