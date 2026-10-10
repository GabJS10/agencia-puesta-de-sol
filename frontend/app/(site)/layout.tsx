import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/session-provider";
import { NotificationsProvider } from "@/components/admin/notifications/NotificationsProvider";
import { getHome } from "@/lib/get-home";
import { getSession } from "@/lib/auth";

// Layout del sitio público: navbar + footer. El panel /admin queda fuera de este
// grupo, por eso no hereda este chrome.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [home, user] = await Promise.all([getHome(), getSession()]);
  const footerData = home.Footer;

  const content = (
    <>
      <Navbar />
      {children}
      <Footer
        number={footerData.number}
        email={footerData.email}
        location={footerData.location}
        AboutFooter={footerData.AboutFooter}
      />
    </>
  );

  // Los admins también reciben los toasts de notificaciones mientras navegan el sitio.
  return (
    <SessionProvider initialUser={user}>
      {user?.role === "ADMIN" ? (
        <NotificationsProvider>{content}</NotificationsProvider>
      ) : (
        content
      )}
    </SessionProvider>
  );
}
