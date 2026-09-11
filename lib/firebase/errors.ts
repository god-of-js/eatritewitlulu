export function firebaseErrorMessage(error: unknown, fallback: string) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account. Log in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again shortly.";
    case "auth/expired-action-code":
    case "auth/invalid-action-code":
      return "That reset link is invalid or has expired.";
    case "permission-denied":
      return "Firestore blocked this write. Publish firebase/firestore.rules, then try again.";
    default:
      return error instanceof Error ? error.message : fallback;
  }
}
