export function HeroSection() {
  return (
    <section className="w-full">
      <div className="relative overflow-hidden">
        {/* Imagen de fondo */}
        <div className="h-64 w-full md:h-70">
          <div 
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80')",
            }}
          />
          {/* Overlay negro transparente */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Contenido superpuesto */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 text-white md:px-12">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="max-w-2xl">
              <h1 className="mb-2 text-3xl font-bold leading-tight md:text-5xl">
              Invierte en el futuro de la agricultura
              </h1>
              <p className="text-lg opacity-90 md:text-xl">
              Apoyás a productores locales, Agrobeat acompaña su trabajo y vos ves tu inversión crecer en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
