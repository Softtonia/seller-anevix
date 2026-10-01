import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import LayoutContent from "@/components/LayoutContent/LayoutContent";
import "./theme-configuration/colorVariable.css";
import "./theme-configuration/typography.css";

export const metadata = {
  title: {
    template: "%s | Anevix",
    default: "Anevix - Your Premium Shopping Destination"
  },
  description: "Shop the latest in Furniture, Clocks, Toys, Lighting, Accessories, and more. Find weekly best deals with exclusive discounts and special offers on Anevix.",
  keywords: "shopping, ecommerce, weekly best deals, furniture discount, clocks, toys, lighting accessories, Anevix, premium online store",
  metadataBase: new URL("https://anevix.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Anevix - Your Premium Shopping Destination",
    description: "Shop the latest in Furniture, Clocks, Toys, Lighting, Accessories, and more. Find weekly best deals with exclusive discounts and special offers on Anevix.",
    url: "https://anevix.com",
    siteName: "Anevix",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Anevix - Your Premium Shopping Destination",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Anevix - Your Premium Shopping Destination",
    description: "Shop the latest in Furniture, Clocks, Toys, Lighting, Accessories, and more. Find weekly best deals with exclusive discounts and special offers on Anevix.",
    images: ["/logo.png"],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="Inter-regular">
        <ThemeRegistry>
          <Toaster
            position="top-right"
            containerStyle={{
              top: 24,
              right: 24,
              zIndex: 99999999,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              },
              success: {
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
          <LayoutContent>
            {children}
          </LayoutContent>
        </ThemeRegistry>
      </body>
    </html>
  );
}
