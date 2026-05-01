import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      {" "}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="text-sm text-gray-500 text-center md:text-left">
          <p className="font-medium text-gray-800">
            © 2026 Zesto. All rights reserved.
          </p>
          <p className="mt-1">
            Built by{" "}
            <a
              href="https://github.com/emtpy-main"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 font-medium hover:underline"
            >
              Pratik Singh
            </a>
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm">
          <a
            href="https://github.com/emtpy-main/zesto"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-black transition"
          >
            <FaGithub />
            <span>GitHub</span>
          </a>

          <a
            href="mailto:zesto.testing@gmail.com"
            className="text-gray-500 hover:text-gray-800 transition"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
