export function Location() {
  return (
    <section className="py-24 bg-background px-4 md:px-20 text-foreground relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 mb-8 md:items-end">
          <div className="flex-1">
             <span className="text-primary text-xs font-bold tracking-widest uppercase mb-4 block">
              Ubicación
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-left mb-4 leading-tight">
              Donde nos encontramos
            </h2>
            <p className="text-muted text-lg max-w-2xl text-left font-light">
              Puesta de Sol se encuentra en el corazón de Riohacha, La Guajira. 
              Un punto de partida estratégico para tu aventura.
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-6xl mx-auto h-[400px] md:h-[500px] overflow-hidden rounded-2xl border border-border shadow-sm relative group">
          <div className="absolute inset-0 z-10 pointer-events-none ring-1 ring-inset ring-border rounded-2xl transition-all duration-500"></div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3909.1679664673047!2d-72.92105977476628!3d11.539805944649064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sPuesta%20De%20Sol%2C%20Cl%2014C%20%2316-19%2C%20Riohacha%2C%20La%20Guajira!5e0!3m2!1ses-419!2sco!4v1768855393140!5m2!1ses-419!2sco"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "grayscale(20%) contrast(1.2) brightness(0.8)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 transition-all duration-500 hover:filter-none"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
