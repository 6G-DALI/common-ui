/* Side-effect CSS imports (AppShell pulls in @6g-dali/ui-theme/shell.css).
   Vite and esbuild handle these natively; this only keeps `tsc` from failing
   to resolve them while emitting declarations. */
declare module '*.css'
