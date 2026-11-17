/**
 * Shared frame for the auth routes (/login, /cadastro, /recuperar,
 * /nova-senha): a centered, single-column card over the app shell.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-7">
      {children}
    </div>
  );
}
