/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import ImageWithPlaceholder from "../../src/components/App/ImageWithPlaceholder.jsx";
import ClothingGrid from "../../src/components/App/Main/ClothingGrid.jsx";

const imageProps = {
  src: "https://example.com/sweater.jpg",
  alt: "Sweater",
  className: "card__image",
};

describe("Image placeholders", () => {
  test("reserves the image frame while loading and reveals the successful image", () => {
    render(<ImageWithPlaceholder {...imageProps} />);
    const image = screen.getByRole("img", { name: "Sweater" });
    const frame = image.closest(".image-placeholder");
    expect(frame).toHaveClass("card__image");
    expect(frame).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading image...")).toBeInTheDocument();
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("decoding", "async");
    fireEvent.load(image);
    expect(frame).toHaveAttribute("aria-busy", "false");
    expect(image).toHaveClass("image-placeholder__image_loaded");
    expect(screen.queryByText("Loading image...")).not.toBeInTheDocument();
  });

  test("a failed image keeps its frame and shows readable fallback text", () => {
    render(<ImageWithPlaceholder {...imageProps} loading="eager" />);
    const image = screen.getByRole("img", { name: "Sweater" });
    fireEvent.error(image);
    expect(image.closest(".image-placeholder")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    expect(image).not.toHaveClass("image-placeholder__image_loaded");
    expect(screen.getByText("Image unavailable")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });

  test.each(["load", "error"])(
    "a new URL starts loading after an earlier %s and ignores old image events",
    (event) => {
      const { rerender } = render(<ImageWithPlaceholder {...imageProps} />);
      const oldImage = screen.getByRole("img");
      fireEvent[event](oldImage);
      rerender(
        <ImageWithPlaceholder
          {...imageProps}
          src="https://example.com/replacement.jpg"
        />,
      );
      const currentImage = screen.getByRole("img");
      fireEvent.load(oldImage);
      expect(currentImage).not.toBe(oldImage);
      expect(currentImage.closest(".image-placeholder")).toHaveAttribute(
        "aria-busy",
        "true",
      );
      expect(screen.getByText("Loading image...")).toBeInTheDocument();
      fireEvent.load(currentImage);
      expect(screen.queryByText("Loading image...")).not.toBeInTheDocument();
    },
  );

  test("missing URLs show a fallback without requesting an image", () => {
    render(<ImageWithPlaceholder alt="Missing garment" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });

  test.each([0, 120])(
    "handles an already-complete cached image with natural width %i",
    (width) => {
      jest
        .spyOn(HTMLImageElement.prototype, "complete", "get")
        .mockReturnValue(true);
      jest
        .spyOn(HTMLImageElement.prototype, "naturalWidth", "get")
        .mockReturnValue(width);
      render(<ImageWithPlaceholder {...imageProps} />);
      expect(screen.queryByText("Loading image...")).not.toBeInTheDocument();
      if (width) {
        expect(screen.getByRole("img")).toHaveClass(
          "image-placeholder__image_loaded",
        );
      } else {
        expect(screen.getByText("Image unavailable")).toBeInTheDocument();
      }
    },
  );
});

describe("Clothing collection loading", () => {
  const items = Array.from({ length: 6 }, (_, index) => ({
    _id: String(index),
    name: `Garment ${index}`,
    imageUrl: `https://example.com/${index}.jpg`,
  }));

  test("an empty pending collection uses noninteractive skeletons", () => {
    const { container } = render(
      <ClothingGrid items={[]} isLoading variant="profile" />,
    );
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll(".card_loading")).toHaveLength(4);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    for (const card of container.querySelectorAll(".card_loading")) {
      expect(card).toHaveAttribute("aria-hidden", "true");
      expect(card).toHaveClass("card_context_profile");
    }
  });

  test("available cards stay usable while an older collection request is pending", () => {
    const onCardClick = jest.fn();
    const { container } = render(
      <ClothingGrid items={items} isLoading onCardClick={onCardClick} />,
    );
    expect(container.querySelector(".card_loading")).toBeNull();
    const images = screen.getAllByRole("img");
    for (const [index, image] of images.entries()) {
      expect(image).toHaveAttribute("loading", index < 4 ? "eager" : "lazy");
    }
    fireEvent.click(screen.getByRole("button", { name: "View Garment 0" }));
    expect(onCardClick).toHaveBeenCalledWith(items[0]);
  });

  test("completed empty collections do not show loading or garment warnings", () => {
    const { container } = render(<ClothingGrid items={[]} />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "false");
    expect(container.querySelector(".card_loading")).toBeNull();
    expect(container.textContent).toBe("");
  });
});
