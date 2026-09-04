import "./globals.css";

export const metadata = {
  title: "Workout Progress Tracker",
  description: "Track workout routines and progress.",
};

export default function RootLayout({children}) {
    return(
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}