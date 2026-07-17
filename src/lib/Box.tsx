import React, {
  createElement,
  useMemo,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { sx, mergeSx } from "./sx";

/**
 * Box — the dc-runtime element primitive.
 *
 * The v3 export drives interactive styling through `style-hover`,
 * `style-active` and `style-focus` string attributes layered on top of a
 * base inline style. Inline CSS can't express `:hover`, so we reproduce
 * that behaviour here: Box tracks hover/active/focus locally and merges the
 * matching CSS strings over the base — preserving the exact v3 interactions.
 */

type BoxProps = {
  as?: ElementType;
  /** Base style — a CSS string (v3 verbatim) or a React style object. */
  sx?: string | CSSProperties;
  /** Applied while hovered (v3 `style-hover`). */
  hover?: string;
  /** Applied while pressed (v3 `style-active`). */
  active?: string;
  /** Applied while focused (v3 `style-focus`). */
  focus?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<React.HTMLAttributes<HTMLElement>, "style">;

export function Box(props: BoxProps) {
  const {
    as = "div",
    sx: base,
    hover,
    active,
    focus,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const [isHover, setHover] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isFocus, setFocus] = useState(false);

  const merged = useMemo(
    () =>
      mergeSx(
        base,
        isHover && hover ? hover : undefined,
        isActive && active ? active : undefined,
        isFocus && focus ? focus : undefined,
        style,
      ),
    [base, hover, active, focus, isHover, isActive, isFocus, style],
  );

  const interactive: React.HTMLAttributes<HTMLElement> = {};
  if (hover) {
    interactive.onMouseEnter = (e) => {
      setHover(true);
      onMouseEnter?.(e);
    };
    interactive.onMouseLeave = (e) => {
      setHover(false);
      setActive(false);
      onMouseLeave?.(e);
    };
  } else {
    interactive.onMouseEnter = onMouseEnter;
    interactive.onMouseLeave = onMouseLeave;
  }
  if (active) {
    interactive.onMouseDown = (e) => {
      setActive(true);
      onMouseDown?.(e);
    };
    interactive.onMouseUp = (e) => {
      setActive(false);
      onMouseUp?.(e);
    };
  } else {
    interactive.onMouseDown = onMouseDown;
    interactive.onMouseUp = onMouseUp;
  }
  if (focus) {
    interactive.onFocus = (e) => {
      setFocus(true);
      onFocus?.(e as React.FocusEvent<HTMLElement>);
    };
    interactive.onBlur = (e) => {
      setFocus(false);
      onBlur?.(e as React.FocusEvent<HTMLElement>);
    };
  } else {
    interactive.onFocus = onFocus;
    interactive.onBlur = onBlur;
  }

  return createElement(
    as,
    { ...rest, ...interactive, style: merged },
    children,
  );
}

/** Convenience: a plain styled element with no interaction layers. */
export function S(
  props: { as?: ElementType; sx?: string | CSSProperties } & Omit<
    React.HTMLAttributes<HTMLElement>,
    "style"
  >,
) {
  const { as = "div", sx: base, children, ...rest } = props;
  return createElement(
    as,
    { ...rest, style: typeof base === "string" ? sx(base) : base },
    children,
  );
}
