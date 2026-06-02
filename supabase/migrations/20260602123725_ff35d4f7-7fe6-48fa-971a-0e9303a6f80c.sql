-- Revoke public execute on the security definer trigger function
REVOKE EXECUTE ON FUNCTION public.log_moderation_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_moderation_change() FROM authenticated;

-- Also fix the existing handle_new_user function if it has the same issue
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Also fix update_updated_at_column
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
