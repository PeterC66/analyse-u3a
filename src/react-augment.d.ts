import 'react';

declare module 'react' {
  interface InputHTMLAttributes<T> {
    // Non-standard but universally supported. Enables folder picking via
    // `<input type="file" webkitdirectory>` for the bulk-load entry point.
    webkitdirectory?: string;
    directory?: string;
  }
}
