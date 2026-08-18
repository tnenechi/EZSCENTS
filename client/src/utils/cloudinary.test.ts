import { describe, it, expect } from "vitest";
import {
  isCloudinaryImageRef,
  getImageUrl,
  buildCloudinaryImage,
} from "./cloudinary";

const cloudinaryRef = { url: "https://res.cloudinary.com/demo/x.jpg", publicId: "x" };

describe("isCloudinaryImageRef", () => {
  it("returns false for a plain string URL", () => {
    expect(isCloudinaryImageRef("https://example.com/x.jpg")).toBe(false);
  });

  it("returns true for a { url, publicId } ref", () => {
    expect(isCloudinaryImageRef(cloudinaryRef)).toBe(true);
  });
});

describe("getImageUrl", () => {
  it("returns a plain string URL unchanged", () => {
    expect(getImageUrl("https://example.com/x.jpg")).toBe(
      "https://example.com/x.jpg",
    );
  });

  it("returns the .url field of a Cloudinary ref", () => {
    expect(getImageUrl(cloudinaryRef)).toBe(cloudinaryRef.url);
  });
});

describe("buildCloudinaryImage", () => {
  it("passes plain string URLs through untouched (non-Cloudinary images)", () => {
    expect(buildCloudinaryImage("https://example.com/x.jpg")).toBe(
      "https://example.com/x.jpg",
    );
  });

  it("builds a format/quality-optimized URL with no resize when no dimensions are given", () => {
    const built = buildCloudinaryImage(cloudinaryRef);
    expect(typeof built).not.toBe("string");
    const url = (built as { toURL: () => string }).toURL();
    expect(url).toContain("f_auto");
    expect(url).toContain("q_auto");
    expect(url).not.toContain("c_fill");
  });

  it("chains a resize transform when width/height are provided", () => {
    const built = buildCloudinaryImage(cloudinaryRef, 400, 500);
    const url = (built as { toURL: () => string }).toURL();
    expect(url).toContain("c_fill,h_500,w_400");
  });

  it("does not resize when only one of width/height is given", () => {
    const built = buildCloudinaryImage(cloudinaryRef, 400);
    const url = (built as { toURL: () => string }).toURL();
    expect(url).not.toContain("c_fill");
  });
});
