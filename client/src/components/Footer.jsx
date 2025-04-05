import React from "react";

export function Footer() {
  return (
    <footer className="bg-gray-100 text-sm text-center p-4 mt-4">
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://github.com/fauzifx/"
          target="_blank"
          className="btn btn-link p-0"
        >
          WinterAct17
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
