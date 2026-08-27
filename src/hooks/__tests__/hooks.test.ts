import { renderHook, waitFor } from "@testing-library/react-native";
import useColorScheme from "../useColorScheme";
import useCachedResources from "../useCachedResources";

describe("Custom Hooks", () => {
  it("useColorScheme returns light or dark scheme", () => {
    const { result } = renderHook(() => useColorScheme());
    expect(["light", "dark"]).toContain(result.current);
  });

  it("useCachedResources loads fonts and finishes loading", async () => {
    const { result } = renderHook(() => useCachedResources());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
