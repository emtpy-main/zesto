import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return ( 
    <div className="relative w-full bg-white overflow-hidden py-4 px-4 sm:px-6">
       
      <div className="absolute -top-10 left-10 w-64 h-64 bg-[#e23744] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute top-0 left-1/3 w-56 h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
 
      <footer className="relative max-w-7xl mx-auto bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-3 z-10">
         
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-16 text-center md:text-left">
           
          <div className="space-y-3 text-gray-800">
            <p className="font-medium text-lg">&copy; 2026 Zesto. All rights reserved.</p>
            <p className="text-sm md:text-base">
              Crafted and developed by{' '}
              <a 
                href="https://github.com/emtpy-main" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#e23744] font-semibold hover:text-[#c12936] hover:underline transition-colors"
              >
                Pratik Singh
              </a>
            </p>
          </div>

          {/* Project Links & Support */}
          <div className="space-y-4 md:text-right flex flex-col items-center md:items-end text-gray-800">
            <a 
              href="https://github.com/emtpy-main/zesto" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-[#e23744] font-semibold text-base hover:text-[#c12936] hover:underline transition-colors"
            >
              <FaGithub className="text-xl" />
             Look Project GitHub: /zesto
            </a>
            <p className="text-sm text-gray-600">
              Profile not verified? Contact admin: <br className="hidden md:block" />
              <a 
                href="mailto:zesto.testing@gmail.com" 
                className="text-[#e23744] font-medium hover:text-[#c12936] hover:underline transition-colors md:mt-1 inline-block"
              >
                zesto.testing@gmail.com
              </a>
            </p>
          </div>

        </div>
      </footer>
      
    </div>
  );
};

export default Footer;