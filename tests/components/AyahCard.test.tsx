import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import { AyahCard } from "@/components/AyahCard";
import { TestProviders } from "./testWrapper";

describe("<AyahCard />", () => {
  it("renders the surah:ayah reference and translation text", async () => {
    await render(
      <TestProviders>
        <AyahCard surah={94} ayah={5} translationText="With hardship comes ease." textOrder="translation_first" />
      </TestProviders>,
    );
    expect(screen.getByText(/94:5/)).toBeTruthy();
    expect(screen.getByText("With hardship comes ease.")).toBeTruthy();
  });

  it("renders Arabic text before the translation when textOrder is arabic_first", async () => {
    await render(
      <TestProviders>
        <AyahCard surah={94} ayah={5} arabicText="فَإِنَّ مَعَ الْعُسْرِ يُسْرًا" translationText="With hardship comes ease." textOrder="arabic_first" />
      </TestProviders>,
    );
    expect(screen.getByText("فَإِنَّ مَعَ الْعُسْرِ يُسْرًا")).toBeTruthy();
  });

  it("calls onToggleFavorite when the favorite action is pressed", async () => {
    const onToggleFavorite = jest.fn();
    await render(
      <TestProviders>
        <AyahCard surah={2} ayah={152} translationText="Remember Me; I will remember you." textOrder="translation_first" onToggleFavorite={onToggleFavorite} isFavorite={false} />
      </TestProviders>,
    );
    fireEvent.press(screen.getByLabelText("Add to favorites"));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("renders theme badges when provided", async () => {
    await render(
      <TestProviders>
        <AyahCard surah={2} ayah={152} translationText="text" textOrder="translation_first" themeLabels={["Gratitude", "Remembrance"]} />
      </TestProviders>,
    );
    expect(screen.getByText("Gratitude")).toBeTruthy();
    expect(screen.getByText("Remembrance")).toBeTruthy();
  });

  it("never truncates the translation text itself (no numberOfLines applied)", async () => {
    const longText = "x".repeat(500);
    await render(
      <TestProviders>
        <AyahCard surah={2} ayah={152} translationText={longText} textOrder="translation_first" />
      </TestProviders>,
    );
    expect(screen.getByText(longText)).toBeTruthy();
  });
});
