import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import "./PrimaryButton.css";

type Variant = "primary" | "outline";

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };

type AsLink = CommonProps & Omit<LinkProps, "className"> & { href?: undefined };

type AsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { to?: undefined };

export type PrimaryButtonProps = AsButton | AsLink | AsAnchor;

export function PrimaryButton(props: PrimaryButtonProps) {
  const { children, variant = "primary", fullWidth = true } = props;
  const className =
    "primary-button" +
    (variant === "outline" ? " primary-button--outline" : "") +
    (fullWidth ? " primary-button--full" : "");

  if ("to" in props && props.to !== undefined) {
    const { to, children: _c, variant: _v, fullWidth: _f, ...rest } = props;
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href !== undefined) {
    const { href, children: _c, variant: _v, fullWidth: _f, ...rest } = props;
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }

  const { children: _c, variant: _v, fullWidth: _f, type, ...rest } =
    props as AsButton;
  return (
    <button type={type ?? "button"} className={className} {...rest}>
      {children}
    </button>
  );
}
