import React from "react";

export function Footer() {
  return (
    <footer className="bg-gray-100 text-sm text-center p-4 mt-4">
      <p className="mb-12 md:mb-1">
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://github.com/fauzifx/"
          target="_blank"
          className="btn btn-link p-0"
        >
          Ahmad Fauzi
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
