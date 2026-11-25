import "./globals.css";

import AppProviders from "@/providers/AppProviders";
import { APP_CONFIG } from "@/config/appConfig";

export const metadata = {
  title: {
    default: `${APP_CONFIG.brand} | ${APP_CONFIG.name}`,
    template: `%s | ${APP_CONFIG.brand}`,
  },

  description: APP_CONFIG.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}