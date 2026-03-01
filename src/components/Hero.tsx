import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="relative z-40 overflow-hidden pb-24 pt-28 sm:pt-36 lg:pb-[120px] lg:pt-[170px] bg-white dark:bg-dark">
      <div className="container mx-auto px-16">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2">
            <div className="mx-auto mb-12 max-w-[530px] text-center lg:mb-0 lg:ml-0 lg:text-left">
              <span className="mb-8 inline-block rounded-full bg-bright-red/10 px-5 py-[10px] text-base font-semibold text-bright-red">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-bright-red"></span>
                SNU Robotics Club
              </span>
              <h1 className="mb-5 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-4xl md:text-[50px] md:leading-[60px]">
                Sigma Intelligence
              </h1>
              <p className="mb-12 text-base font-medium text-gray dark:text-gray/80">
                국내 최초 설립 대학 로봇동아리. Est. 1984.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-md bg-bright-red px-8 py-3 text-base font-semibold text-white transition-all hover:bg-darker-red"
                >
                  Our Projects
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-md bg-gray/10 px-8 py-3 text-base font-semibold text-dark transition-all hover:bg-gray/20 dark:text-white dark:hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
          
          <div className="w-full px-4 lg:w-1/2">
            <div className="relative mx-auto lg:ml-auto max-w-[600px]">
               {/* Abstract decorative element representing the image in reference */}
               <div className="relative aspect-video w-full rounded-lg bg-gradient-to-tr from-bright-red/20 to-dark/20 backdrop-blur-sm dark:from-bright-red/10 dark:to-white/5 border border-gray/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
                  <div className="h-32 w-32 rounded-full bg-bright-red opacity-20 blur-3xl"></div>
                  <span className="relative z-10 text-lg font-medium text-dark dark:text-white">
                    [Hero Image Placeholder]
                  </span>
               </div>
               
               {/* Decorative dots/pattern from reference */}
               <div className="absolute -bottom-8 -left-8 -z-10">
                 <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4" cy="4" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="4" cy="24" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="4" cy="44" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="4" cy="64" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="24" cy="4" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="24" cy="24" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="24" cy="44" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="24" cy="64" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="44" cy="4" r="4" className="fill-bright-red opacity-20" />
                    <circle cx="44" cy="24" r="4" className="fill-bright-red opacity-20" />
                 </svg>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -z-10 h-full w-1/3 bg-gradient-to-bl from-gray/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 -z-10 h-full w-1/3 bg-gradient-to-tr from-bright-red/5 to-transparent"></div>
    </section>
  );
}
