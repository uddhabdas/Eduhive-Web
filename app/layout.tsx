import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Logo from "@/image.png";


export const metadata: Metadata = {
  title: "EduHive",
  description:
    "User web experience for EduHive learning platform - browse courses, watch lectures, and manage your learning.",
  icons: {
    icon: Logo.src,
    shortcut: Logo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={Logo.src} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <Script id="anti-inspect" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          (function(){
            var prevent=function(e){e.preventDefault();e.stopPropagation();return false};
            document.addEventListener('contextmenu',prevent,true);
            document.addEventListener('dragstart',prevent,true);
            var keyBlock=function(e){
              var k=(e.key||'').toUpperCase();
              var code=e.keyCode||e.which;
              var ctrl=e.ctrlKey||e.metaKey;
              var shift=e.shiftKey;
              var alt=e.altKey;
              if(code===123||k==='F12') return prevent(e);
              if(ctrl&&shift&&(k==='I'||k==='J'||k==='C'||k==='K'||k==='P')) return prevent(e);
              if(ctrl&&(k==='U'||k==='S')) return prevent(e);
              if(e.metaKey&&alt&&(k==='I'||k==='J'||k==='C')) return prevent(e);
            };
            window.addEventListener('keydown',keyBlock,true);
            document.addEventListener('keydown',keyBlock,true);
          })();
        ` }} />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}


