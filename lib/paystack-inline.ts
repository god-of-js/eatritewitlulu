export type PaystackPopupTransaction = {
  reference: string;
};

type PaystackPopupCallbacks = {
  onSuccess: (transaction: PaystackPopupTransaction) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
};

type PaystackPopupOptions = PaystackPopupCallbacks & {
  publicKey: string;
  email: string;
  amountNaira: number;
  reference: string;
  accessCode?: string;
};

type PaystackPopInstance = {
  resumeTransaction?: (
    accessCode: string,
    callbacks?: {
      onSuccess?: (transaction: PaystackPopupTransaction) => void;
      onCancel?: () => void;
      onError?: (error: { message?: string }) => void;
    },
  ) => void;
  newTransaction?: (options: {
    key: string;
    email: string;
    amount: number;
    ref?: string;
    currency?: string;
    onSuccess?: (transaction: PaystackPopupTransaction) => void;
    onCancel?: () => void;
  }) => void;
};

type PaystackPopGlobal = {
  new (): PaystackPopInstance;
  setup?: (options: {
    key: string;
    email: string;
    amount: number;
    ref?: string;
    currency?: string;
    callback: (transaction: PaystackPopupTransaction) => void;
    onClose: () => void;
  }) => { openIframe: () => void };
};

declare global {
  interface Window {
    PaystackPop?: PaystackPopGlobal;
  }
}

export function loadPaystackInline() {
  return new Promise<void>((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const src = "https://js.paystack.co/v2/inline.js";
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Paystack.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack."));
    document.body.appendChild(script);
  });
}

export async function openPaystackPopup(options: PaystackPopupOptions) {
  await loadPaystackInline();

  const Pop = window.PaystackPop;
  if (!Pop) {
    throw new Error("Paystack did not load. Refresh and try again.");
  }

  const callbacks = {
    onSuccess: options.onSuccess,
    onCancel: options.onCancel,
    onError: (error: { message?: string }) => {
      options.onError?.(error.message || "Paystack could not open.");
    },
  };

  if (typeof Pop === "function") {
    const popup = new Pop();
    if (options.accessCode && typeof popup.resumeTransaction === "function") {
      popup.resumeTransaction(options.accessCode, callbacks);
      return;
    }
    if (typeof popup.newTransaction === "function") {
      popup.newTransaction({
        key: options.publicKey,
        email: options.email,
        amount: options.amountNaira * 100,
        ref: options.reference,
        currency: "NGN",
        onSuccess: options.onSuccess,
        onCancel: options.onCancel,
      });
      return;
    }
  }

  if (typeof Pop.setup === "function") {
    Pop.setup({
      key: options.publicKey,
      email: options.email,
      amount: options.amountNaira * 100,
      ref: options.reference,
      currency: "NGN",
      callback: options.onSuccess,
      onClose: options.onCancel,
    }).openIframe();
    return;
  }

  throw new Error("Paystack popup is not available.");
}
