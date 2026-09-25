import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/session-provider";
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

  return (
    <SessionProvider initialUser={user}>
      <Navbar />
      {children}
      <Footer
        number={footerData.number}
        email={footerData.email}
        location={footerData.location}
        AboutFooter={footerData.AboutFooter}
      />
    </SessionProvider>
  );
}
