import { renderHook, waitFor } from "@testing-library/react-native";
import * as Font from "expo-font";
import { recordError as firebaseRecordError } from "@react-native-firebase/crashlytics";
import useColorScheme from "../useColorScheme";
import useCachedResources from "../useCachedResources";

describe("Custom Hooks", () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__DEV__ = false;
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
  });

  it("useColorScheme returns light or dark scheme", () => {
    const { result } = renderHook(() => useColorScheme());
    expect(["light", "dark"]).toContain(result.current);
  });

  it("useCachedResources loads fonts and finishes loading", async () => {
    const { result } = renderHook(() => useCachedResources());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
    expect(firebaseRecordError).not.toHaveBeenCalled();
  });

  it("useCachedResources records a non-fatal Crashlytics error when font loading fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const loadError = new Error("font load failed");
    (Font.loadAsync as jest.Mock).mockRejectedValueOnce(loadError);

    const { result } = renderHook(() => useCachedResources());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(firebaseRecordError).toHaveBeenCalledWith(
      expect.anything(),
      loadError,
      "resources.loadCachedResources"
    );
    warnSpy.mockRestore();
  });
});
