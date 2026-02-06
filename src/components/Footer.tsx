import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-dark text-white">
      <hr className="border-gray/20 md:my-12 lg:my-16" />
      <div className="container mx-auto px-16">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
            <div className="mb-12 max-w-[360px] lg:mb-16">
              <Link href="/" className="mb-8 inline-block text-3xl font-bold">
                Sigma<span className="text-bright-red">Intelligence</span>
              </Link>
              <p className="mb-9 text-base leading-relaxed text-gray">
                Official website for Sigma Intelligence (SNU Robotics Club). 
                Innovating for tomorrow.
              </p>
              <div className="flex items-center gap-4">
                {/* Social Placeholders */}
                <a href="https://www.facebook.com/sigmaintelligence/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-bright-red transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/sigma-intelligence/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-bright-red transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <img src="/icons/linkedin-svgrepo-com.svg" alt="LinkedIn" className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com/sigma_intelligence_/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-bright-red transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-white">Useful Links</h2>
              <ul>
                <li><Link href="/about" className="mb-4 inline-block text-base text-gray hover:text-bright-red">About</Link></li>
                <li><Link href="/projects" className="mb-4 inline-block text-base text-gray hover:text-bright-red">Projects</Link></li>
                <li><Link href="/sponsors" className="mb-4 inline-block text-base text-gray hover:text-bright-red">Sponsors</Link></li>
                <li><Link href="/members" className="mb-4 inline-block text-base text-gray hover:text-bright-red">Members</Link></li>
              </ul>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-white">Support</h2>
              <ul>
                <li><Link href="/contact" className="mb-4 inline-block text-base text-gray hover:text-bright-red">Contact Us</Link></li>
                <li><Link href="/faq" className="mb-4 inline-block text-base text-gray hover:text-bright-red">FAQ</Link></li>
                <li><Link href="/privacy" className="mb-4 inline-block text-base text-gray hover:text-bright-red">Privacy Policy</Link></li>
                <li><Link href="/terms" className="mb-4 inline-block text-base text-gray hover:text-bright-red">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-3/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-white">Contact</h2>
              <p className="mb-4 text-base text-gray">SNU Robotics Club</p>
              <p className="mb-4 text-base text-gray">Seoul National University</p>
              <p className="mb-4 text-base text-gray">record.snusigma@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1f2133] py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-base text-gray">
            © {new Date().getFullYear()} Sigma Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
