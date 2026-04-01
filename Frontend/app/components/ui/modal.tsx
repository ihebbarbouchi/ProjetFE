"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Override the max-width of the modal panel. Default: max-w-lg */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

interface ModalHeaderProps {
  children: React.ReactNode;
  /** Renders the × close button when provided */
  onClose?: () => void;
  className?: string;
}

interface ModalBodyProps {
  children: React.ReactNode;
  /** Override padding / layout. Default: px-6 py-6 */
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm:  "sm:max-w-sm",
  md:  "sm:max-w-md",
  lg:  "sm:max-w-lg",
  xl:  "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

// ─── Modal (root) ─────────────────────────────────────────────────────────────

export function Modal({ open, onOpenChange, children, size = "lg" }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in  data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />

        {/* Panel */}
        <DialogPrimitive.Content
          className={cn(
            // position
            "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            // sizing
            "w-full max-w-[calc(100%-2rem)]",
            sizeMap[size],
            // look
            "bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden",
            // animations
            "duration-200",
            "data-[state=open]:animate-in  data-[state=open]:fade-in-0  data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          {/* Hidden title for screen-readers when no ModalHeader is rendered */}
          <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>

          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ─── ModalHeader ──────────────────────────────────────────────────────────────

export function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-5 border-b border-gray-100",
        className,
      )}
    >
      {/* Title — visible text overrides the sr-only DialogPrimitive.Title */}
      <DialogPrimitive.Title className="text-xl font-bold text-gray-900 leading-none">
        {children}
      </DialogPrimitive.Title>

      {onClose && (
        <DialogPrimitive.Close
          onClick={onClose}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
            "transition-colors cursor-pointer focus:outline-none",
          )}
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Fermer</span>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

// ─── ModalBody ────────────────────────────────────────────────────────────────

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("px-6 py-6 max-h-[75vh] overflow-y-auto custom-scrollbar", className)}>
      {children}
    </div>
  );
}

// ─── ModalFooter ──────────────────────────────────────────────────────────────

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4",
        "border-t border-gray-100 bg-gray-50/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── ModalClose ───────────────────────────────────────────────────────────────

export const ModalClose = DialogPrimitive.Close;

// ─── ModalCancelButton ────────────────────────────────────────────────────────

export function ModalCancelButton({
  onClick,
  children = "Annuler",
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Button variant="outline" onClick={onClick} className="cursor-pointer">
      {children}
    </Button>
  );
}

// ─── ModalConfirmButton ───────────────────────────────────────────────────────

export function ModalConfirmButton({
  onClick,
  children = "Confirmer",
  disabled = false,
  variant = "default",
  className,
}: {
  onClick: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: "default" | "destructive";
  className?: string;
}) {
  const variantClass =
    variant === "destructive"
      ? "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200"
      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200";

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn("cursor-pointer", variantClass, className)}
    >
      {children}
    </Button>
  );
}