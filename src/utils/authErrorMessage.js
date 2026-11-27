export function authErrorMessage(error) {
  if (error.code === 'invalid_credentials') {
    return 'Email or password is incorrect. If you’re new to FoodFinder, create an account first.';
  }
  if (error.code === 'email_not_confirmed') {
    return 'Confirm your email using the link Supabase sent, then sign in again.';
  }
  return error.message;
}
