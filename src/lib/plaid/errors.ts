const PLAID_ERROR_MESSAGES: Record<string, string> = {
  ITEM_LOGIN_REQUIRED:
    "Your bank connection needs to be re-authenticated. Please re-link your account.",
  INSTITUTION_DOWN:
    "This bank is currently experiencing issues. Please try again later.",
  INSTITUTION_NOT_RESPONDING:
    "This bank is not responding. Please try again later.",
  INVALID_CREDENTIALS:
    "The credentials provided were invalid. Please try again.",
  INVALID_MFA: "The MFA response was incorrect. Please try again.",
  ITEM_LOCKED:
    "Your account has been locked by your bank. Please contact your bank.",
  ITEM_NOT_SUPPORTED:
    "This account type is not supported. Please try a different account.",
  NO_ACCOUNTS: "No eligible accounts were found at this institution.",
  PRODUCTS_NOT_SUPPORTED:
    "This institution does not support the required features.",
};

export function getPlaidUserMessage(errorCode: string): string {
  return (
    PLAID_ERROR_MESSAGES[errorCode] ??
    "Something went wrong connecting to your bank. Please try again."
  );
}
