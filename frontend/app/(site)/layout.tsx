import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getHome } from "@/lib/get-home";

// Layout del sitio público: navbar + footer. El panel /admin queda fuera de este
// grupo, por eso no hereda este chrome.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const home = await getHome();
  const footerData = home.Footer;

  return (
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
}
