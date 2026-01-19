export function Location() {
  return (
    <section className="py-20 bg-white px-4 md:px-20 text-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-left mb-3">
          Donde nos encontramos
        </h2>
        <p className="text-gray-600 text-lg mb-6 md:mb-8 text-left">
          Puesta de Sol se encuentra en la ciudad de Riohacha, La Guajira,
          Colombia.
        </p>
        <div className="w-full max-w-5xl mx-auto h-64 md:h-112.5 overflow-hidden rounded-3xl md:rounded-4xl border border-white/20 shadow-2xl relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3909.1679664673047!2d-72.92105977476628!3d11.539805944649064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sPuesta%20De%20Sol%2C%20Cl%2014C%20%2316-19%2C%20Riohacha%2C%20La%20Guajira!5e0!3m2!1ses-419!2sco!4v1768855393140!5m2!1ses-419!2sco"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 transition-all duration-500"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
